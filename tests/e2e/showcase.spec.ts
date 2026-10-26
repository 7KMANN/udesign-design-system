import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 1000 },
]

for (const viewport of viewports) {
  test(`${viewport.name} showcase covers every theme and profile`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.goto("/")

    const root = page.locator("html")
    const themeToggle = page.getByTestId("theme-toggle")
    const profileToggle = page.getByTestId("profile-toggle")
    const pageSelect = page.getByLabel("Page")

    await expect(themeToggle).toBeVisible()
    await expect(profileToggle).toBeVisible()
    await expect(themeToggle).toHaveAccessibleName(/switch to dark theme/i)
    await expect(profileToggle).toHaveAccessibleName(/switch to operations profile/i)

    const stateSelect = page.getByRole("combobox", { name: "Record state" })
    await stateSelect.focus()
    await page.keyboard.press("ArrowDown")
    await expect(page.getByRole("option", { name: "Active" })).toBeVisible()
    expect((await new AxeBuilder({ page }).include('[role="listbox"]').analyze()).violations, `${viewport.name} open select`).toEqual([])
    await page.keyboard.press("End")
    await page.keyboard.press("Enter")
    await expect(stateSelect).toContainText("Paused")

    const sheetTrigger = page.getByRole("button", { name: "Open sheet" })
    await sheetTrigger.click()
    await expect(page.getByRole("dialog", { name: "Responsive sheet" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Close sheet" })).toBeFocused()
    expect((await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations, `${viewport.name} open sheet`).toEqual([])
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog", { name: "Responsive sheet" })).not.toBeVisible()
    await expect(sheetTrigger).toBeFocused()

    for (const pageName of ["system", "login", "dashboard", "analytics"]) {
      await pageSelect.selectOption(pageName)

      for (const combination of [
        { theme: "light", profile: "presentation" },
        { theme: "dark", profile: "presentation" },
        { theme: "dark", profile: "operations" },
        { theme: "light", profile: "operations" },
      ]) {
        if ((await root.getAttribute("data-theme")) !== combination.theme) await themeToggle.click()
        if ((await root.getAttribute("data-design")) !== combination.profile) await profileToggle.click()

        await expect(root).toHaveAttribute("data-theme", combination.theme)
        await expect(root).toHaveAttribute("data-design", combination.profile)
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
          `${viewport.name} ${pageName} ${combination.theme} ${combination.profile} must not overflow horizontally`,
        ).toBe(true)

        const accessibility = await new AxeBuilder({ page }).analyze()
        expect(accessibility.violations, `${viewport.name} ${pageName} ${combination.theme} ${combination.profile}`).toEqual([])

        await page.screenshot({
          path: testInfo.outputPath(`${viewport.name}-${pageName}-${combination.theme}-${combination.profile}.png`),
          fullPage: true,
        })
      }
    }
  })
}

// In a browser, with the compiled utilities: a label hidden with visibility leaves no name.
test("a pending button keeps its accessible name", async ({ page }) => {
  await page.goto("/")
  const pending = page.getByRole("button", { name: "Save draft" })
  await expect(pending).toHaveAttribute("aria-busy", "true")
  await expect(pending).toBeDisabled()
  await expect(pending).toHaveAccessibleName("Save draft")
})

test("a dialog holds its close button while its action runs, and onOpenChange decides on Escape", async ({ page }) => {
  // The demo's send ends on a timer. The page's clock stands still while the test looks, so a
  // slow machine cannot let the send end first, and runs again at the end. axe needs a
  // running clock, so it scans the dialog before the clock stops.
  await page.clock.install()
  await page.goto("/")
  await page.getByRole("button", { name: "Open held dialog" }).click()
  const dialog = page.getByRole("dialog", { name: "Send the order" })
  const close = dialog.getByRole("button", { name: "Close order" })
  await expect(close).toBeEnabled()
  expect((await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations, "held dialog").toEqual([])
  await page.clock.pauseAt(Date.now() + 1000)
  await dialog.getByRole("button", { name: "Send the order" }).click()
  await expect(close).toBeDisabled()
  await expect(dialog.getByRole("button", { name: "Send the order" }), "the pending action keeps its name").toHaveAttribute("aria-busy", "true")
  await page.keyboard.press("Escape")
  await page.waitForTimeout(150)
  await expect(dialog, "the caller ignores Escape while the order sends").toBeVisible()
  await expect(close).toBeDisabled()
  await page.clock.runFor(2000)
  await expect(dialog, "the dialog closes itself once the send ends").toBeHidden()
})

// Only the title row leaves room for the close button: a block in the description runs out
// to the footer's edge, and still starts below the button's icon at every padding.
for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 1000 }]) {
  for (const profile of ["presentation", "operations"]) {
    test(`the close button's room is the title row, ${profile} at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto("/")
      if (profile === "operations") await page.getByTestId("profile-toggle").click()
      await expect(page.locator("html")).toHaveAttribute("data-design", profile)
      await page.getByRole("button", { name: "Open held dialog" }).click()
      const dialog = page.getByRole("dialog", { name: "Send the order" })
      const box = async (locator: ReturnType<typeof page.locator>) => (await locator.boundingBox())!
      const close = await box(dialog.getByRole("button", { name: "Close order" }))
      const icon = await box(dialog.getByRole("button", { name: "Close order" }).locator("svg"))
      const block = await box(dialog.getByRole("status"))
      const send = await box(dialog.getByRole("button", { name: "Send the order" }))
      const description = await box(dialog.getByText("While it sends", { exact: false }))
      // The title's content box: where a long title has to wrap.
      const titleTextRight = await dialog.getByRole("heading", { name: "Send the order" }).evaluate((h) => h.getBoundingClientRect().right - parseFloat(getComputedStyle(h).paddingRight))
      expect(Math.abs(block.x + block.width - (send.x + send.width)), "block and footer share a right edge").toBeLessThanOrEqual(1)
      expect(description.y - (icon.y + icon.height), "the description starts below the close icon").toBeGreaterThanOrEqual(3.5)
      expect(titleTextRight, "a long title wraps before the close button").toBeLessThanOrEqual(close.x + 0.5)
    })
  }
}

// Why native-select exists: an open Radix Select sets pointer-events and a scroll lock on
// <body>, and the browser restyles every element of the page on each choice. The
// platform's select opens without touching <body>.
test("a native select leaves <body> alone when it opens; a Radix Select does not", async ({ page }) => {
  await page.goto("/")
  const body = () => page.evaluate(() => ({ pointerEvents: document.body.style.pointerEvents, locked: document.body.hasAttribute("data-scroll-locked") }))
  const native = page.getByRole("combobox", { name: "Record owner" })
  await native.click()
  expect(await body()).toEqual({ pointerEvents: "", locked: false })
  await page.keyboard.press("Escape")
  await native.selectOption("studio")
  await expect(native).toHaveValue("studio")
  const radix = page.getByRole("combobox", { name: "Record state" })
  await radix.click()
  await expect(page.getByRole("listbox")).toBeVisible()
  expect(await body()).toEqual({ pointerEvents: "none", locked: true })
  await page.keyboard.press("Escape")
})

// D-45, in the browser: the scroll lock's property stays on <body> and no longer inherits,
// so setting it restyles <body> alone. Below <body> it reads its initial 0px.
test("tokens.css keeps the scroll lock's property on <body>", async ({ page }) => {
  await page.goto("/")
  const read = await page.evaluate(() => {
    document.body.style.setProperty("--removed-body-scroll-bar-size", "15px")
    const child = document.body.firstElementChild as Element
    const value = (el: Element) => getComputedStyle(el).getPropertyValue("--removed-body-scroll-bar-size").trim()
    const result = { body: value(document.body), child: value(child) }
    document.body.style.removeProperty("--removed-body-scroll-bar-size")
    return result
  })
  expect(read).toEqual({ body: "15px", child: "0px" })
})

test("motion tokens collapse to zero under prefers-reduced-motion, moment scale stays inert without it", async ({ page }) => {
  await page.goto("/")

  // Baseline (no reduced-motion emulation): the general motion tokens carry
  // real values, and data-game="on" is pinned by the showcase shell, so the
  // gamification-exclusive scale tokens are present too.
  const baseline = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement)
    return {
      durationFast: style.getPropertyValue("--motion-duration-fast").trim(),
      momentScale2: style.getPropertyValue("--moment-intensity-2-scale").trim(),
    }
  })
  expect(baseline.durationFast).toBe("150ms")
  expect(baseline.momentScale2).toBe("1.04")

  await page.emulateMedia({ reducedMotion: "reduce" })
  const reduced = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement)
    return {
      durationFast: style.getPropertyValue("--motion-duration-fast").trim(),
      durationEmphasis: style.getPropertyValue("--motion-duration-emphasis").trim(),
      momentScale1: style.getPropertyValue("--moment-intensity-1-scale").trim(),
      momentScale2: style.getPropertyValue("--moment-intensity-2-scale").trim(),
    }
  })
  expect(reduced.durationFast).toBe("0ms")
  expect(reduced.durationEmphasis).toBe("0ms")
  expect(reduced.momentScale1).toBe("1")
  expect(reduced.momentScale2).toBe("1")

  // The showcase's own live readout (KitchenSink's Motion section) reflects
  // the emulated preference too - proves the page can actually observe it,
  // not just that the token layer can.
  await page.getByRole("combobox", { name: "Page" }).selectOption("system")
  await expect(page.getByTestId("motion-showcase")).toContainText(/prefers-reduced-motion.*currently reads\s*reduce/is)
})
