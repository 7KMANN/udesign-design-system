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
