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

// D-51, ported from Boutique's appearance check: an element that shows nothing never takes a
// gap, nor room of its own. An idle live region sits after a stack, never in its gap.
const empties = (page: Page) =>
  page.evaluate(() => {
    const CONTENT = "img, svg, input, button, select, textarea, video, canvas, picture, iframe"
    const painted = (el: Element) => {
      const s = getComputedStyle(el)
      const border = ["top", "right", "bottom", "left"].some((side) => parseFloat(s.getPropertyValue(`border-${side}-width`)) > 0 && s.getPropertyValue(`border-${side}-style`) !== "none")
      return border || !["rgba(0, 0, 0, 0)", "transparent"].includes(s.backgroundColor) || s.backgroundImage !== "none" || s.boxShadow !== "none"
    }
    const empty = (el: Element) => (el.textContent ?? "").trim() === "" && !el.matches(CONTENT) && !el.querySelector(CONTENT) && !painted(el) && ![...el.querySelectorAll("*")].some(painted)
    const inFlow = (el: Element) => {
      const s = getComputedStyle(el)
      return s.display !== "none" && s.display !== "contents" && s.position !== "absolute" && s.position !== "fixed"
    }
    const gapOf = (el: Element | null) => {
      if (!el) return null
      const s = getComputedStyle(el)
      if (!/flex|grid/.test(s.display)) return null
      const px = (v: string) => (v === "normal" ? 0 : parseFloat(v) || 0)
      return { row: px(s.rowGap), column: px(s.columnGap), across: /flex/.test(s.display) && !s.flexDirection.startsWith("column") }
    }
    const found: string[] = []
    for (const el of document.querySelectorAll("#root *")) {
      if (!inFlow(el) || el.closest("svg") || !empty(el)) continue
      const r = el.getBoundingClientRect()
      const gap = gapOf(el.parentElement)
      const name = `${el.tagName.toLowerCase()}${el.getAttribute("role") ? `[${el.getAttribute("role")}]` : ""}`
      if (gap && (gap.across ? gap.column > 0 && r.width === 0 : gap.row > 0 && r.height === 0)) found.push(`in a gap: ${name}`)
      else if (r.height > 0.5 && r.width > 0.5) found.push(`room: ${name} ${Math.round(r.height)}px`)
    }
    return found
  })

for (const screen of ["presentation", "operations"]) {
  for (const viewport of viewports) {
    test(`${screen} reference screen, ${viewport.name}: nothing empty takes room`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto(`/examples.html?screen=${screen}`)
      await page.locator("#root > *").first().waitFor()
      expect(await empties(page)).toEqual([])
    })
  }
}

test("the empty-room audit sees an idle live region placed in a gap", async ({ page }) => {
  await page.goto("/examples.html?screen=presentation")
  const status = page.locator('#root [role="status"]')
  await status.waitFor({ state: "attached" })
  // The mistake the rule names: the idle region moved into the action row, whose gap it takes.
  await status.evaluate((el) => el.previousElementSibling!.append(el))
  expect(await empties(page)).toEqual(["in a gap: div[status]"])
})

test("presentation reference screen: the idle status speaks after the row, its words carrying the margin", async ({ page }) => {
  await page.goto("/examples.html?screen=presentation")
  const status = page.locator('#root [role="status"]')
  await status.waitFor({ state: "attached" })
  expect((await status.boundingBox())?.height ?? 0, "idle, it takes no room").toBe(0)
  await page.getByRole("button", { name: "Approuver l’épreuve" }).click()
  await expect(status).toHaveText("Épreuve approuvée. La production commence.")
  const row = (await page.getByRole("button", { name: "Approuver l’épreuve" }).boundingBox())!
  const words = (await status.locator("p").boundingBox())!
  expect(words.y - (row.y + row.height), "--space-4 under the row").toBeCloseTo(16, 0)
})

// D-52, D-53: the presentation page's header and footer sit on the sections' column. The header
// is one row a touch target high, the same height with or without its action; the footer's
// links are touch targets.
for (const viewport of viewports) {
  test(`presentation reference screen, ${viewport.name}: one header row whoever is on the page, and a footer on the column`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto("/examples.html?screen=presentation")
    const header = page.locator("header").first()
    await header.waitFor()
    // The sections' content edge: the column's box less its gutter.
    const column = { x: await page.locator("#root section > div").first().evaluate((el) => el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).paddingLeft)) }
    const lockup = (await header.getByText("UDesign", { exact: true }).boundingBox())!
    const action = (await header.getByRole("link", { name: "Mes commandes" }).boundingBox())!
    const row = (await header.locator(":scope > div").boundingBox())!
    expect(row.height, "a touch target high").toBeGreaterThanOrEqual(44)
    expect(Math.abs(lockup.x - column.x), "the lockup on the column's left edge").toBeLessThanOrEqual(1)
    expect(Math.abs(lockup.y + lockup.height / 2 - (action.y + action.height / 2)), "one row").toBeLessThanOrEqual(1)
    const withAction = (await header.boundingBox())!.height
    await header.getByRole("link", { name: "Mes commandes" }).evaluate((el) => el.closest("header > div > div:last-child")!.remove())
    expect((await header.boundingBox())!.height, "the same height without the action").toBeCloseTo(withAction, 1)

    const footer = page.locator("footer")
    const address = (await footer.getByText("Entreprise exemple", { exact: false }).boundingBox())!
    expect(Math.abs(address.x - column.x), "the footer on the column's left edge").toBeLessThanOrEqual(1)
    for (const name of ["819 555-0100", "contact@example.com"]) {
      expect((await footer.getByRole("link", { name }).boundingBox())!.height, `${name} is a touch target`).toBeGreaterThanOrEqual(44)
    }
  })
}

test("static header and footer: one row a touch target high with or without the action, links a touch target high", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("/examples.html")
  await page.setContent(`<!doctype html><html data-design="presentation"><head><link rel="stylesheet" href="/dist/tokens.css">
    <style>*, ::before, ::after { box-sizing: border-box; }</style></head>
    <body class="ud-page-canvas">
    <header class="ud-page-header" id="with"><p class="ud-h3">UDesign</p><a class="ud-btn ud-btn-ghost" href="#">Ce n’est pas vous ?</a></header>
    <header class="ud-page-header" id="without"><p class="ud-h3">UDesign</p></header>
    <section class="ud-page-section"><p id="column">Column</p></section>
    <footer class="ud-contact-footer"><p class="ud-label">Entreprise exemple</p><p class="ud-label"><a href="tel:+18195550100">819 555-0100</a> · <a href="mailto:contact@example.com">contact@example.com</a></p></footer>
    </body></html>`, { waitUntil: "load" })
  const height = async (selector: string) => (await page.locator(selector).boundingBox())!.height
  expect(await height("#with")).toBeCloseTo(await height("#without"), 1)
  expect(await height("#without")).toBeGreaterThanOrEqual(44 + 32)
  const column = (await page.locator("#column").boundingBox())!.x
  expect((await page.locator("#with .ud-h3").boundingBox())!.x).toBeCloseTo(column, 0)
  expect((await page.locator(".ud-contact-footer .ud-label").first().boundingBox())!.x).toBeCloseTo(column, 0)
  expect(await height('a[href^="tel:"]')).toBeGreaterThanOrEqual(44)
})

// D-46: a page's title steps down one role on a phone, with no size of its own on the element.
// Presentation: --text-h1 (40px) at 375, --text-display (56px) from 800. Operations does not move.
for (const [screen, selector, phone, desktop] of [
  ["presentation", "h1.ud-display", 40, 56],
  ["operations", "h1.ud-h1", 20, 20],
] as const) {
  test(`${screen} reference screen: the page title is ${phone}px on a phone and ${desktop}px on a desktop`, async ({ page }) => {
    const size = async (width: number) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`/examples.html?screen=${screen}`)
      const title = page.locator(selector).first()
      await title.waitFor()
      expect(await title.getAttribute("style"), "no inline size").toBeNull()
      return title.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    }
    expect(await size(375)).toBeCloseTo(phone, 1)
    expect(await size(1440)).toBeCloseTo(desktop, 1)
  })
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

// Below md the shell's rows were auto, so a page shorter than the screen gave half of its
// spare height to the toolbar. The reference screen is longer than a phone, so its toolbar
// height is the natural one; emptying the panes must not change it.
test("operations on a phone, short page: the toolbar keeps its height and the panes take the rest", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("/examples.html?screen=operations")
  const toolbar = page.locator("header")
  await page.locator("main").waitFor()
  const natural = (await toolbar.boundingBox())!.height
  await page.evaluate(() => {
    for (const pane of document.querySelectorAll("main > section")) pane.replaceChildren(document.createTextNode("Short"))
  })
  expect((await toolbar.boundingBox())!.height).toBeCloseTo(natural, 0)
  const main = (await page.locator("main").boundingBox())!
  expect(main.y + main.height, "the panes reach the bottom of the screen").toBeCloseTo(812, 0)
})

test("static shell on a phone, short page: the toolbar keeps its height and the panes take the rest", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("/examples.html")
  const shell = (content: string) => `<!doctype html><html data-design="operations"><head><link rel="stylesheet" href="/dist/tokens.css"></head>
    <body class="ud-app-shell"><aside class="ud-app-shell-sidebar" id="nav" popover><nav><a class="ud-btn ud-btn-ghost" href="#q">Commandes</a></nav></aside>
    <header class="ud-app-shell-toolbar"><button class="ud-btn ud-btn-ghost ud-app-shell-menu" type="button" popovertarget="nav">Menu</button><h1 class="ud-h1">File</h1></header>
    <main class="ud-app-shell-panes"><section class="ud-app-shell-pane" aria-label="Commandes">${content}</section></main></body></html>`
  await page.setContent(shell('<div style="height: 2000px">Long</div>'), { waitUntil: "load" })
  const natural = (await page.locator("header").boundingBox())!.height
  await page.setContent(shell("<p>Short</p>"), { waitUntil: "load" })
  expect((await page.locator("header").boundingBox())!.height).toBeCloseTo(natural, 0)
  const main = (await page.locator("main").boundingBox())!
  expect(main.y + main.height, "the panes reach the bottom of the screen").toBeCloseTo(812, 0)
})

test("operations on a desktop mouse: the sidebar shows and the menu hides", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/examples.html?screen=operations")
  await expect(page.locator("aside")).toBeVisible()
  await expect(page.getByRole("button", { name: "Menu" })).toBeHidden()
  // Compact on a fine pointer: the search field is 36px in a 44px bar (D-33).
  expect(Math.round((await page.getByRole("textbox", { name: "Rechercher une commande" }).boundingBox())!.height)).toBe(36)
})
