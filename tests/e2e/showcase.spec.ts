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
    await expect(profileToggle).toHaveAccessibleName(/switch to functional profile/i)

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
        { theme: "light", profile: "brand" },
        { theme: "dark", profile: "brand" },
        { theme: "dark", profile: "functional" },
        { theme: "light", profile: "functional" },
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
