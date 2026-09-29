import { expect, test, type Page } from "@playwright/test"

// Composition defects no lexical checker sees, measured on the reference screens (examples/),
// whose content is fixed, so every finding is a regression. Ported from GlobalVision's
// e2e-live/audit.spec.ts: a card stretched past its content (ban 31), a desktop toolbar
// control touching the toolbar edge (D-33), and a phone page wider than the phone.

const DEAD_SPACE_PX = 24

const audit = (page: Page, deadSpace: number) =>
  page.evaluate((deadSpace) => {
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden"
    }
    const stretched: object[] = []
    for (const card of document.querySelectorAll('[data-slot="card"]')) {
      if (!visible(card)) continue
      const box = card.getBoundingClientRect()
      if (box.height < 80) continue
      const style = getComputedStyle(card)
      const innerBottom = box.bottom - parseFloat(style.paddingBottom) - parseFloat(style.borderBottomWidth)
      // The real content, text and replaced elements, so a stretched wrapper cannot hide the gap.
      let contentBottom = -Infinity
      const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT)
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        let r: DOMRect | null = null
        if (node.nodeType === Node.TEXT_NODE) {
          if (!node.textContent?.trim()) continue
          const range = document.createRange()
          range.selectNodeContents(node)
          r = range.getBoundingClientRect()
        } else if ((node as Element).matches("img, svg, input, textarea, button, a, canvas, video, [role=progressbar], hr")) {
          r = (node as Element).getBoundingClientRect()
        }
        if (r && r.height > 0 && r.bottom > contentBottom) contentBottom = r.bottom
      }
      if (contentBottom === -Infinity) continue
      // One nested inset (CardContent's own padding) is expected under the content.
      const inset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--surface-padding")) || 24
      const gap = Math.round(innerBottom - contentBottom - inset)
      if (gap > deadSpace) stretched.push({ card: card.textContent?.trim().slice(0, 40), gap })
    }
    const toolbarEdge: object[] = []
    const toolbar = document.querySelector("header")
    if (toolbar && visible(toolbar) && innerWidth >= 768) {
      const bar = toolbar.getBoundingClientRect()
      for (const el of toolbar.querySelectorAll('button, input, [role="combobox"]')) {
        if (!visible(el)) continue
        const r = el.getBoundingClientRect()
        if (r.top - bar.top < 3 || bar.bottom - r.bottom < 3) {
          toolbarEdge.push({ control: el.getAttribute("aria-label") ?? el.textContent?.trim(), height: Math.round(r.height), toolbar: Math.round(bar.height) })
        }
      }
    }
    const overflow = document.documentElement.scrollWidth - innerWidth
    return { stretched, toolbarEdge, overflow }
  }, deadSpace)

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "desktop", width: 1440, height: 1000 },
]

for (const screen of ["operations", "presentation"]) {
  for (const viewport of viewports) {
    for (const theme of ["light", "dark"]) {
      test(`${screen} reference screen, ${viewport.name}, ${theme}: no stretched card, toolbar edge or overflow`, async ({ page }) => {
        await page.setViewportSize(viewport)
        await page.goto(`/examples.html?screen=${screen}`)
        await page.evaluate((t) => { document.documentElement.dataset.theme = t }, theme)
        await page.locator("#root > *").first().waitFor()
        await page.evaluate(() => document.fonts.ready)
        const found = await audit(page, DEAD_SPACE_PX)
        expect(found.stretched, "cards stretched past their content").toEqual([])
        expect(found.toolbarEdge, "toolbar controls touching the toolbar edge").toEqual([])
        expect(found.overflow, "page wider than the viewport").toBeLessThanOrEqual(0)
      })
    }
  }
}

test("operations on a phone: the sidebar hides and the same nav opens in a sheet", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("/examples.html?screen=operations")
  await expect(page.locator("aside")).toBeHidden()
  await page.getByRole("button", { name: "Menu" }).click()
  const sheet = page.getByRole("dialog", { name: "UDesign" })
  await expect(sheet).toBeVisible()
  await expect(sheet.getByRole("link", { name: /Production/ })).toHaveAttribute("aria-current", "page")
  await sheet.getByRole("link", { name: /Commandes/ }).click()
  await expect(sheet).toBeHidden()
})

test("operations on a desktop mouse: the sidebar shows and the menu hides", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/examples.html?screen=operations")
  await expect(page.locator("aside")).toBeVisible()
  await expect(page.getByRole("button", { name: "Menu" })).toBeHidden()
  // Compact on a fine pointer: the search field is 36px in a 44px bar (D-33).
  expect(Math.round((await page.getByRole("textbox", { name: "Rechercher une commande" }).boundingBox())!.height)).toBe(36)
})
