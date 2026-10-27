import { expect, test, type Locator, type Page } from "@playwright/test"

// Registry components measured where jsdom cannot lay out, on showcase/fixtures.html, and the
// plain-JS gallery on showcase/static-gallery.html.

// D-49: the rows a ChoiceGroup lays out, counted from where its buttons land.
async function layout(group: Locator) {
  const boxes = await group.getByRole("radio").evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect()
      return { top: Math.round(r.top), width: r.width, height: r.height }
    }),
  )
  const tops = [...new Set(boxes.map((b) => b.top))]
  return { rows: tops.map((top) => boxes.filter((b) => b.top === top).length), widths: boxes.map((b) => b.width), heights: boxes.map((b) => b.height) }
}

for (const [width, count, rows] of [
  ["16rem", 5, [3, 2]],
  ["16rem", 6, [3, 3]],
  ["16rem", 7, [4, 3]],
  ["30rem", 6, [6]],
  ["9.5rem", 3, [3]],
  ["20rem", 10, [5, 5]],
] as const) {
  test(`a choice group of ${count} in ${width} lays out rows of ${rows.join(" + ")}, in equal cells a touch target wide`, async ({ page }) => {
    await page.goto("/fixtures.html?fixture=choices")
    const found = await layout(page.getByTestId(`choices-${width}-${count}`))
    expect(found.rows).toEqual([...rows])
    expect(Math.max(...found.widths) - Math.min(...found.widths), "equal cells").toBeLessThan(0.5)
    expect(Math.min(...found.widths), "every cell keeps the touch target").toBeGreaterThanOrEqual(44)
    expect(Math.min(...found.heights)).toBeGreaterThanOrEqual(44)
  })
}

// D-54, D-55: one gallery, two builds. Each check runs on the React Gallery (fixtures.html, with
// Tailwind's preflight and Swiper's stylesheet after the tokens) and on dist/ud-gallery.js
// (static-gallery.html, the tokens linked before Swiper's stylesheet, as UDesign Pages links them).
const builds = [
  { name: "React", url: "/fixtures.html?fixture=galleries", first: '[data-testid="gallery-a"]', second: '[data-testid="gallery-b"]' },
  { name: "plain-JS", url: "/static-gallery.html", first: "#first .ud-gallery", second: "#second .ud-gallery" },
]

const shown = (gallery: Locator) => gallery.locator('.ud-gallery-thumb[aria-pressed="true"]').getAttribute("aria-label")

async function open(page: Page, url: string, first: string, second: string) {
  await page.goto(url)
  // The first page of a run waits on the dev server's first build.
  for (const selector of [first, second]) await expect(page.locator(`${selector} .swiper-initialized`)).toBeAttached({ timeout: 20_000 })
  return { a: page.locator(first), b: page.locator(second) }
}

for (const build of builds) {
  test(`${build.name} gallery: the arrow keys move the gallery in focus, else the one under the pointer, never both`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const { a, b } = await open(page, build.url, build.first, build.second)
    const startA = await shown(a)
    const startB = await shown(b)
    await page.mouse.move(640, 790)
    await page.keyboard.press("ArrowRight")
    await page.waitForTimeout(100)
    expect([await shown(a), await shown(b)], "no focus and no pointer: nothing moves").toEqual([startA, startB])
    await b.locator(".ud-gallery-main").hover()
    await page.keyboard.press("ArrowRight")
    await expect.poll(() => shown(b)).not.toBe(startB)
    expect(await shown(a), "only the gallery under the pointer").toBe(startA)
    const nowB = await shown(b)
    await a.locator(".ud-gallery-thumb").first().focus()
    await page.keyboard.press("ArrowRight")
    await expect.poll(() => shown(a)).not.toBe(startA)
    expect(await shown(b), "the focus wins over the pointer").toBe(nowB)
  })

  // Boutique's case: the pointer rests on a gallery while a modal opens from the keyboard (a Radix
  // sheet here, a modal <dialog> on the static page). The arrow keys are the modal's.
  test(`${build.name} gallery: behind an open modal, the gallery the pointer rests on keeps its photo`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const { a } = await open(page, build.url, build.first, build.second)
    const start = await shown(a)
    await a.locator(".ud-gallery-main").hover()
    await page.getByRole("button", { name: "Ouvrir le panier" }).focus()
    await page.keyboard.press("Enter")
    const modal = page.getByRole("dialog", { name: "Panier" })
    await expect(modal).toBeVisible()
    await page.keyboard.press("ArrowRight")
    await page.waitForTimeout(150)
    expect(await shown(a), "the modal has the keys").toBe(start)
    await page.keyboard.press("Escape")
    await expect(modal).toBeHidden()
    await a.locator(".ud-gallery-main").hover({ position: { x: 24, y: 24 } })
    await page.keyboard.press("ArrowRight")
    await expect.poll(() => shown(a), "the modal closed, the pointer's gallery has them again").not.toBe(start)
  })

  // The browser can send the pointer's leave a frame after a modal opens. Here the modal opens and the
  // arrow is dispatched in one task, so no pointer event comes between: the gallery behind must stay.
  test(`${build.name} gallery: an arrow pressed the moment a modal opens leaves the gallery behind it`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const { a } = await open(page, build.url, build.first, build.second)
    const start = await shown(a)
    await a.locator(".ud-gallery-main").hover()
    const seen = await page.evaluate(async () => {
      const events: string[] = []
      for (const type of ["pointerover", "pointerenter", "pointerout", "pointerleave", "pointermove"]) addEventListener(type, () => events.push(type), true)
      const inModal = () => Boolean(document.activeElement?.closest("[role='dialog'], dialog"))
      ;[...document.querySelectorAll("button")].find((b) => b.textContent === "Ouvrir le panier")!.click()
      // Microtasks only: React commits a click's update in one, and no pointer event runs between them.
      for (let i = 0; i < 50 && !inModal(); i += 1) await Promise.resolve()
      const focused = inModal()
      document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true, composed: true }))
      return { focused, events }
    })
    expect(seen.focused, "the modal holds the focus").toBe(true)
    expect(seen.events, "no pointer event before the arrow").toEqual([])
    await page.waitForTimeout(150)
    expect(await shown(a), "the gallery behind the modal stays").toBe(start)
  })

  test(`${build.name} gallery: Page Down and Page Up scroll the page, the focus in a gallery`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const { a } = await open(page, build.url, build.first, build.second)
    await a.locator(".ud-gallery-thumb").first().focus()
    const before = await shown(a)
    await page.keyboard.press("PageDown")
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200)
    expect(await shown(a)).toBe(before)
    await page.keyboard.press("PageUp")
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(200)
    expect(await shown(a)).toBe(before)
  })

  test(`${build.name} gallery: copies, alt and thumbnail names, named arrows, and one skin whichever stylesheet loads last`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const { a } = await open(page, build.url, build.first, build.second)
    const slides = await a.locator(".swiper-slide img").evaluateAll((imgs) =>
      imgs.map((img) => ({ alt: img.getAttribute("alt"), copies: (img.getAttribute("srcset") ?? "").split(", ").map((c) => c.split(" ")[1]), sizes: img.getAttribute("sizes") })),
    )
    expect(slides.map((s) => s.alt)).toEqual(["Devant, T-shirt exemple, Blanc", "Dos, T-shirt exemple, Blanc", "Photo 1, T-shirt exemple, Blanc"])
    for (const slide of slides) expect([slide.copies, slide.sizes]).toEqual([["160w", "640w", "1200w"], "50vw"])
    expect(await a.locator(".ud-gallery-thumb").evaluateAll((thumbs) => thumbs.map((t) => t.getAttribute("aria-label")))).toEqual(["Devant", "Dos", "Photo 1"])
    await expect(a.getByRole("button", { name: "Photo suivante" })).toBeVisible()
    const main = (await a.locator(".ud-gallery-main").boundingBox())!
    const next = (await a.locator(".swiper-button-next").boundingBox())!
    expect(next.width).toBeCloseTo(44, 0)
    expect(next.height).toBeCloseTo(44, 0)
    expect(next.y + next.height / 2, "the touch target is centred on the photo").toBeCloseTo(main.y + main.height / 2, 0)
    expect((await a.locator(".swiper-button-next svg").boundingBox())!.height, "the chevron stays icon-sized").toBeCloseTo(16, 0)
    const [thumb, card] = await a.locator(".ud-gallery-thumb").first().evaluate((el) => {
      const probe = document.createElement("div")
      probe.style.background = "var(--card)"
      document.body.append(probe)
      const colours = [getComputedStyle(el).backgroundColor, getComputedStyle(probe).backgroundColor]
      probe.remove()
      return colours
    })
    expect(thumb, "the thumbnail keeps its surface over a preflight reset").toBe(card)
  })

  // Review M9: UDesign Pages' ud-gallery.css before v3.3.0 placed the arrows itself. A page that moves
  // to these tokens while it still links that file, after them or before, keeps its arrows centred.
  test(`${build.name} gallery: the arrows stay centred with the old ud-gallery.css linked, before or after the tokens`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const { a } = await open(page, build.url, build.first, build.second)
    const old = ".ud-gallery .swiper-button-prev, .ud-gallery .swiper-button-next { box-sizing: border-box; width: var(--touch-target-min); height: var(--touch-target-min); margin-top: calc(var(--touch-target-min) / -2); }"
    for (const where of ["after", "before"] as const) {
      await page.evaluate(({ css, where }) => {
        document.getElementById("old-ud-gallery")?.remove()
        const style = Object.assign(document.createElement("style"), { id: "old-ud-gallery", textContent: css })
        if (where === "after") document.head.append(style)
        else document.head.prepend(style)
      }, { css: old, where })
      const main = (await a.locator(".ud-gallery-main").boundingBox())!
      const next = (await a.locator(".swiper-button-next").boundingBox())!
      expect(next.y + next.height / 2, `the old file linked ${where} the tokens`).toBeCloseTo(main.y + main.height / 2, 0)
    }
  })

  test(`${build.name} gallery: the photo eases on the standard duration, and moves at once under reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    for (const [motion, duration] of [["no-preference", "250ms"], ["reduce", "0ms"]] as const) {
      await page.emulateMedia({ reducedMotion: motion })
      const { b } = await open(page, build.url, build.first, build.second)
      // Every duration Swiper sets on the slides' wrapper; it puts 0ms back once a move ends.
      await b.locator(".swiper-wrapper").evaluate((el) => {
        const seen: string[] = []
        ;(window as unknown as { __durations: string[] }).__durations = seen
        new MutationObserver(() => seen.push((el as HTMLElement).style.transitionDuration)).observe(el, { attributes: true, attributeFilter: ["style"] })
      })
      await b.locator(".swiper-button-next").click()
      const durations = () => page.evaluate(() => [...new Set((window as unknown as { __durations: string[] }).__durations)].filter(Boolean))
      await expect.poll(durations).toContain(duration)
      if (duration === "0ms") expect(await durations(), "no move takes time under reduced motion").toEqual(["0ms"])
    }
  })

  test(`${build.name} gallery: nothing shifts while the page opens, and a drag moves the photo`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.addInitScript(() => {
      const w = window as unknown as { __shift: number }
      w.__shift = 0
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as Array<{ value: number; hadRecentInput: boolean }>) if (!entry.hadRecentInput) w.__shift += entry.value
      }).observe({ type: "layout-shift", buffered: true })
    })
    const { b } = await open(page, build.url, build.first, build.second)
    await page.waitForTimeout(300)
    expect(await page.evaluate(() => (window as unknown as { __shift: number }).__shift)).toBeLessThan(0.001)
    const before = await shown(b)
    const box = (await b.locator(".ud-gallery-main").boundingBox())!
    await page.mouse.move(box.x + box.width * 0.85, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.15, box.y + box.height / 2, { steps: 8 })
    await page.mouse.up()
    await expect.poll(() => shown(b)).not.toBe(before)
  })
}

// Boutique's move to v3.3.0, gap 4: every card's opening photo was fetched with the page. A gallery
// without priority now waits until it is near; the page's main image is fetched at once, first.
test("React gallery: a card's opening photo waits until it is near, the page's main image does not", async ({ page }) => {
  const asked: string[] = []
  page.on("request", (request) => asked.push(request.url()))
  await page.setViewportSize({ width: 1280, height: 800 })
  const { a } = await open(page, builds[0].url, builds[0].first, builds[0].second)
  await page.waitForLoadState("load")
  await page.waitForTimeout(300)
  expect(asked.filter((url) => url.includes("set=c")), "nothing of the gallery far below the screen").toEqual([])
  const main = a.locator(".swiper-slide-active img")
  expect(await main.evaluate((img: HTMLImageElement) => [img.getAttribute("loading"), img.fetchPriority, img.complete]), "not lazy, fetched first, loaded").toEqual([null, "high", true])
  await page.getByTestId("gallery-c").scrollIntoViewIfNeeded()
  await expect.poll(() => asked.some((url) => url.includes("photo-2.svg") && url.includes("set=c")), { message: "near the screen, it loads" }).toBe(true)
})

test("React gallery: an arrow a choice group handles moves the choice, never a photo", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  const { a } = await open(page, builds[0].url, builds[0].first, builds[0].second)
  const before = await shown(a)
  await a.locator(".ud-gallery-main").hover()
  await page.getByRole("radio", { name: "M", exact: true }).focus()
  await page.keyboard.press("ArrowRight")
  await expect(page.getByRole("radio", { name: "L", exact: true })).toHaveAttribute("aria-checked", "true")
  await page.waitForTimeout(100)
  expect(await shown(a)).toBe(before)
})

test("React gallery: another colour is a new set that opens on its first photo, in the same box", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  const { a } = await open(page, builds[0].url, builds[0].first, builds[0].second)
  await a.locator(".ud-gallery-thumb").nth(1).click()
  await expect.poll(() => shown(a)).toBe("Dos")
  // Where the gallery sits on the page, whatever the page's scroll.
  const place = () => a.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height }
  })
  const before = await place()
  await page.getByRole("radio", { name: "Noir", exact: true }).click()
  await expect(a.locator(".swiper-slide img").first()).toHaveAttribute("alt", "Devant, T-shirt exemple, Noir")
  await expect.poll(() => shown(a)).toBe("Devant")
  expect(await place()).toEqual(before)
})

// D-57: specifications, React and static: each label beside its value, a grouped pair on the same
// grid, the value muted, a long value wrapping inside the list at 375px.
for (const [name, open] of [
  ["React", async (page: Page) => page.goto("/fixtures.html?fixture=specs")],
  [
    "static",
    async (page: Page) => {
      await page.goto("/examples.html")
      await page.setContent(`<!doctype html><html data-design="presentation"><head><link rel="stylesheet" href="/dist/tokens.css"></head>
        <body class="ud-page-canvas"><main style="padding: 16px"><dl class="ud-description-list" data-testid="specs"><dt>Tissu</dt><dd>Coton épais, 6,5 oz</dd>
        <div><dt>Coupe</dt><dd>Ample</dd></div><dt>Entretien</dt><dd>Lavage-à-froid-avec-des-couleurs-semblables-et-séchage-par-culbutage-à-basse-température</dd></dl></main></body></html>`, { waitUntil: "load" })
    },
  ],
] as const) {
  test(`${name} description list: labels beside their values, inside the list on a phone`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await open(page)
    const list = page.getByTestId("specs")
    const box = async (text: string) => (await list.getByText(text, { exact: true }).boundingBox())!
    for (const [label, value] of [["Tissu", "Coton épais, 6,5 oz"], ["Coupe", "Ample"]]) {
      const [l, v] = [await box(label), await box(value)]
      expect(Math.abs(l.y - v.y), `${label} and its value share a row`).toBeLessThan(1)
      expect(v.x - (l.x + l.width), "16px between the columns").toBeGreaterThanOrEqual(15.5)
    }
    expect((await box("Ample")).x, "a grouped pair stays on the grid").toBeCloseTo((await box("Coton épais, 6,5 oz")).x, 0)
    const outer = (await list.boundingBox())!
    const long = (await list.locator("dd").last().boundingBox())!
    expect(long.x + long.width, "a long value wraps inside the list").toBeLessThanOrEqual(outer.x + outer.width + 0.5)
    const [value, muted] = await list.locator("dd").first().evaluate((el) => {
      const probe = document.createElement("span")
      probe.style.color = "var(--muted-foreground)"
      document.body.append(probe)
      const colours = [getComputedStyle(el).color, getComputedStyle(probe).color]
      probe.remove()
      return colours
    })
    expect(value).toBe(muted)
    expect(await list.locator("dt").first().evaluate((el) => getComputedStyle(el).fontWeight)).toBe("600")
  })
}

// Chromium's own accessibility tree, not a library's reading of it. It named an unavailable choice
// "XL , unavailable": the label and the words were two boxes of the button, and it put a space
// between them (Boutique's move to v3.3.0, gap 3).
async function chromiumNames(page: Page, role: string) {
  const cdp = await page.context().newCDPSession(page)
  const { nodes } = (await cdp.send("Accessibility.getFullAXTree")) as { nodes: Array<{ role?: { value?: string }; name?: { value?: string }; ignored?: boolean }> }
  return nodes.filter((n) => !n.ignored && n.role?.value === role).map((n) => n.name?.value ?? "")
}

test("in Chromium an unavailable choice is named by its label, a comma and the words", async ({ page }) => {
  await page.goto("/fixtures.html?fixture=choices")
  await expect(page.getByTestId("choices-open").getByRole("radio").first()).toBeVisible({ timeout: 20_000 })
  const names = await chromiumNames(page, "radio")
  expect(names.filter((name) => name.includes("unavailable"))).toEqual(["XL, unavailable", "XL, unavailable"])
  expect(names, "an available choice keeps its label alone").toContain("S")
})

// D-59: options chosen by their detail are rows: one per choice at every width, the detail at the
// row's end, a long label wrapping inside its row, each named in one piece by Chromium.
for (const width of [375, 1280]) {
  test(`at ${width}px a choice group of rows gives each choice its own row, its detail at the end`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/fixtures.html?fixture=choice-rows")
    const group = page.getByTestId("rows").locator('[data-slot="choice-group"]')
    await expect(group.getByRole("radio").first()).toBeVisible({ timeout: 20_000 })
    const rows = await group.getByRole("radio").evaluateAll((els) =>
      els.map((el) => {
        const box = el.getBoundingClientRect()
        const style = getComputedStyle(el)
        const label = el.querySelector('[data-slot="choice-label"]')!.getBoundingClientRect()
        const detail = el.querySelector('[data-slot="choice-detail"]')!.getBoundingClientRect()
        const end = box.right - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth)
        return { top: box.top, bottom: box.bottom, left: box.left, right: box.right, end, label, detail }
      }),
    )
    const groupBox = (await group.boundingBox())!
    rows.forEach((row, i) => {
      expect(row.left, `row ${i}: from the group's start`).toBeCloseTo(groupBox.x, 0)
      expect(row.right, `row ${i}: to the group's end`).toBeCloseTo(groupBox.x + groupBox.width, 0)
      expect(row.detail.right, `row ${i}: its detail at the end`).toBeCloseTo(row.end, 0)
      expect(row.label.right, `row ${i}: its label before the detail`).toBeLessThanOrEqual(row.detail.left)
      expect(row.label.bottom, `row ${i}: its label inside the row`).toBeLessThanOrEqual(row.bottom)
      if (i) expect(row.top, `row ${i}: below the one before`).toBeGreaterThanOrEqual(rows[i - 1].bottom)
    })
    const lines = rows[3].label.height / rows[0].label.height
    if (width === 375) expect(lines, "the long label wraps inside its row on a phone").toBeGreaterThan(1.5)
    else expect(lines, "and holds one line on a desktop").toBeCloseTo(1, 1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth), "the page does not scroll sideways").toBeLessThanOrEqual(width)
    expect((await chromiumNames(page, "radio")).slice(0, 4)).toEqual([
      "Broderie devant et dos, 79 $",
      "Broderie devant seulement, 53 $",
      "Broderie au dos seulement, 59 $, Non disponible",
      "Broderie devant et dos, avec le nom de l’équipe sur la manche gauche, 89 $",
    ])
  })
}

// Review I1 (v3.4.0): rows draw as Boutique's option rows did, which its appearance review passed: body
// text on its line, a regular label, the detail semibold in the numeric pair, Boutique's ring mark and its
// row heights. D-59 lists the six things that still differ, such as the subtle press of a wide surface.
test("rows look as Boutique's option rows did: body text, a regular label, a semibold numeric detail, a ring mark", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 })
  await page.goto("/fixtures.html?fixture=choice-rows")
  const group = page.getByTestId("rows")
  await expect(group.getByRole("radio").first()).toBeVisible({ timeout: 20_000 })
  const look = (name: RegExp) =>
    group.getByRole("radio", { name }).evaluate((row) => {
      const style = (el: Element) => getComputedStyle(el)
      const mark = row.firstElementChild!
      const label = row.querySelector('[data-slot="choice-label"]')!
      const detail = row.querySelector('[data-slot="choice-detail"]')!
      const probe = Object.assign(document.createElement("span"), { textContent: "0" })
      probe.style.fontFamily = "var(--font-numeric)"
      probe.style.fontVariantNumeric = "var(--font-numeric-variant)"
      row.append(probe)
      const numeric = [style(probe).fontFamily, style(probe).fontVariantNumeric]
      probe.remove()
      return {
        text: [style(row).fontSize, style(row).lineHeight],
        label: style(label).fontWeight,
        detail: [style(detail).fontWeight, style(detail).fontFamily === numeric[0], style(detail).fontVariantNumeric === numeric[1]],
        mark: [mark.getBoundingClientRect().width, style(mark).borderTopWidth, style(mark).borderTopColor === style(row).borderTopColor],
        height: row.getBoundingClientRect().height,
      }
    })
  const free = await look(/^Broderie devant et dos, 79/)
  expect(free.text, "body text on its line").toEqual(["16px", "24px"])
  expect(free.label, "a regular label").toBe("400")
  expect(free.detail, "the detail semibold in the numeric pair").toEqual(["600", true, true])
  expect(free.mark.slice(0, 2), "a 16px mark, a 2px ring").toEqual([16, "2px"])
  const chosen = await look(/devant seulement/)
  expect(chosen.mark.slice(1), "chosen, a 5px ring in the chosen border's colour").toEqual(["5px", true])
  expect((await look(/manche gauche/)).height, "the long label's row, as Boutique's at 375px").toBeCloseTo(90, 0)
  await page.evaluate(() => (document.documentElement.dataset.design = "operations"))
  const detail = group.getByRole("radio").first().locator('[data-slot="choice-detail"]')
  expect(await detail.evaluate((el) => getComputedStyle(el).fontVariantNumeric), "tabular figures in operations").toBe("tabular-nums")
})

// Review I3 (v3.4.0): a node is read in the name; none and a falsy one add no box and no comma; a long
// one never squeezes the label or runs out of its row, it moves under the label.
test("at 375px a row's detail: a node is read, none and a falsy one add nothing, a long one moves under the label", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 })
  await page.goto("/fixtures.html?fixture=choice-rows")
  const group = page.getByTestId("rows-edge")
  await expect(group.getByRole("radio").first()).toBeVisible({ timeout: 20_000 })
  // [label, the detail the name reads, or null for none]. None, false, "", null, true and a blank string
  // give none (re-review N4); the last three details hold the label's 8ch and the row's edge (N5).
  const cases: Array<[string, string | null]> = [
    ["Un nœud", "89 $ 79 $"],
    ["Sans détail", null],
    ["Détail faux", null],
    ["Détail vide", null],
    ["Détail nul", null],
    ["Détail vrai", null],
    ["Détail blanc", null],
    ["Un long détail", "à partir de 1 234,56 $ par pièce, taxes en sus"],
    ["Un détail moyen", "à partir de 79,00 $ par pièce"],
    ["Un très long détail", "à partir de 1 234,56 $ par pièce, taxes en sus, livraison comprise au Québec, selon les quantités"],
    ["Un court détail", "à partir de 79 $"],
  ]
  const named = (await chromiumNames(page, "radio")).filter((name) => cases.some(([label]) => name === label || name.startsWith(`${label}, `)))
  expect(named).toEqual(cases.map(([label, detail]) => (detail ? `${label}, ${detail}` : label)))
  const rows = await group.getByRole("radio").evaluateAll((els) =>
    els.map((el) => {
      const labelEl = el.querySelector('[data-slot="choice-label"]')!
      const probe = document.createElement("span")
      probe.style.cssText = "display:inline-block;width:8ch"
      labelEl.append(probe)
      const ch8 = probe.getBoundingClientRect().width
      probe.remove()
      const label = labelEl.getBoundingClientRect()
      const detail = el.querySelector('[data-slot="choice-detail"]')?.getBoundingClientRect()
      return {
        boxes: el.querySelectorAll('[data-slot="choice-detail"]').length,
        overflow: el.scrollWidth - el.clientWidth,
        right: el.getBoundingClientRect().right,
        ch8,
        label: { width: label.width, bottom: label.bottom },
        detail: detail && { top: detail.top, right: detail.right, height: detail.height },
      }
    }),
  )
  expect(rows, "one row per case").toHaveLength(cases.length)
  expect(rows.map((r) => r.boxes), "a detail box only where there is a detail").toEqual(cases.map(([, detail]) => (detail ? 1 : 0)))
  rows.forEach((row, i) => {
    const label = cases[i][0]
    expect(row.overflow, `${label}: nothing runs out of the row`).toBeLessThanOrEqual(0)
    if (!row.detail) expect(row.label.width, `${label}: no detail takes no room`).toBeCloseTo(rows[1].label.width, 0)
    else {
      expect(row.detail.right, `${label}: the detail stays inside its row`).toBeLessThanOrEqual(row.right)
      if (row.detail.top < row.label.bottom - 1) expect(row.label.width, `${label}: beside a detail the label keeps 8ch`).toBeGreaterThanOrEqual(row.ch8 - 0.5)
    }
  })
  const at = (label: string) => rows[cases.findIndex(([l]) => l === label)]
  for (const label of ["Un long détail", "Un détail moyen", "Un très long détail"]) {
    expect(at(label).detail!.top, `${label}: moves under the label`).toBeGreaterThanOrEqual(at(label).label.bottom - 1)
  }
  expect(at("Un très long détail").detail!.height, "wider than the row, it wraps there").toBeGreaterThan(30)
  expect(at("Un court détail").detail!.top, "a short detail stays beside the label").toBeLessThan(at("Un court détail").label.bottom - 1)
})

// Review M3 (v3.4.0): rows read no column query, so in a parent sized by its content they size as a
// block, from their longest row up to what the page gives, never as the buttons' 148px size container.
test("at 375px rows in a parent sized by its content take their rows' width, never the size container's", async ({ page }) => {
  await page.setViewportSize(phone)
  await page.goto("/fixtures.html?fixture=choices-phone")
  for (const parent of ["table-cell", "inline-block"]) {
    const group = page.getByTestId(`rows-in-${parent}`).locator('[data-slot="choice-group"]')
    await expect(group).toBeVisible({ timeout: 20_000 })
    const width = (await group.boundingBox())!.width
    expect(width, `${parent}: its rows' width, up to the page`).toBeGreaterThan(300)
    expect(width, `${parent}: never past the page`).toBeLessThanOrEqual(phone.width - 32)
  }
  expect(await pageScroll(page), "the page does not scroll sideways").toBeLessThanOrEqual(phone.width)
})

// Review I1: held while it saves, a group keeps its choice's look; only a choice that cannot be had
// is dashed, and the other choices take the disabled surface.
test("a held choice group keeps its choice's look, and only a choice that cannot be had is dashed", async ({ page }) => {
  await page.goto("/fixtures.html?fixture=choices")
  const token = (name: string) =>
    page.evaluate((n) => {
      const probe = document.createElement("div")
      probe.style.background = `var(${n})`
      document.body.append(probe)
      const colour = getComputedStyle(probe).backgroundColor
      probe.remove()
      return colour
    }, name)
  const [selected, disabled, card] = [await token("--interactive-selected"), await token("--interactive-disabled"), await token("--card")]
  const look = (group: string, name: string | RegExp) =>
    page.getByTestId(group).getByRole("radio", typeof name === "string" ? { name, exact: true } : { name }).evaluate((el) => {
      const s = getComputedStyle(el)
      return [el.getAttribute("aria-checked"), s.backgroundColor, s.borderTopStyle]
    })
  expect(await look("choices-held", "S"), "the held choice").toEqual(["true", selected, "solid"])
  expect(await look("choices-held", "M"), "the others, held").toEqual(["false", disabled, "solid"])
  expect(await look("choices-held", /^XL.+unavailable$/), "what cannot be had").toEqual(["false", disabled, "dashed"])
  expect(await look("choices-open", "S")).toEqual(["true", selected, "solid"])
  expect(await look("choices-open", "M")).toEqual(["false", card, "solid"])
  expect(await look("choices-open", /^XL.+unavailable$/)).toEqual(["false", disabled, "dashed"])
})

// Re-review N8: the rows' chosen, held and unavailable looks, as the buttons': the chosen row keeps its
// surface, its ring and a solid border while held; the others take the disabled surface; only what
// cannot be had is dashed, its label struck through.
test("rows keep the chosen look while held, and only a choice that cannot be had is dashed", async ({ page }) => {
  await page.goto("/fixtures.html?fixture=choice-rows")
  await expect(page.getByTestId("rows-held").getByRole("radio").first()).toBeVisible({ timeout: 20_000 })
  const token = (name: string) =>
    page.evaluate((n) => {
      const probe = document.createElement("div")
      probe.style.background = `var(${n})`
      probe.style.color = "var(--interactive-selected-border)"
      document.body.append(probe)
      const colours = [getComputedStyle(probe).backgroundColor, getComputedStyle(probe).color]
      probe.remove()
      return colours
    }, name)
  const [[selected, ring], [disabled], [card]] = [await token("--interactive-selected"), await token("--interactive-disabled"), await token("--card")]
  const look = (group: string, name: RegExp) =>
    page.getByTestId(group).getByRole("radio", { name }).evaluate((el) => {
      const s = getComputedStyle(el)
      const label = getComputedStyle(el.querySelector('[data-slot="choice-label"]')!)
      return { checked: el.getAttribute("aria-checked"), surface: s.backgroundColor, border: s.borderTopStyle, ring: s.boxShadow, struck: label.textDecorationLine }
    })
  for (const group of ["rows-held", "rows"]) {
    const chosen = await look(group, /devant seulement/)
    expect([chosen.checked, chosen.surface, chosen.border], `${group}: the chosen row`).toEqual(["true", selected, "solid"])
    expect(chosen.ring, `${group}: its ring`).toContain(`${ring} 0px 0px 0px 1px inset`)
    const other = await look(group, /^Broderie devant et dos, 79/)
    expect([other.checked, other.surface, other.border], `${group}: another row`).toEqual(["false", group === "rows-held" ? disabled : card, "solid"])
    const unavailable = await look(group, /au dos seulement/)
    expect([unavailable.surface, unavailable.border, unavailable.struck], `${group}: what cannot be had`).toEqual([disabled, "dashed", "line-through"])
  }
})

// Review M6: a long list fills its rows at a phone's width instead of standing in eleven rows of two.
test("a choice group of 22 at 343px fills five rows", async ({ page }) => {
  await page.goto("/fixtures.html?fixture=choices")
  expect((await layout(page.getByTestId("choices-long"))).rows).toEqual([5, 5, 5, 5, 2])
})

const phone = { width: 375, height: 812 }
const pageScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth)

// Review M5: where the parent's width comes from its content, a size container is 0px wide. The
// group asks for three touch targets instead, 9.25rem, never a full row (review N1): at a phone's
// width five sizes lie 3 + 2 in 148px, and the page does not scroll sideways.
test("at 375px a choice group whose parent sizes to its content takes three touch targets, never 0px", async ({ page }) => {
  await page.setViewportSize(phone)
  await page.goto("/fixtures.html?fixture=choices-phone")
  for (const parent of ["table-cell", "inline-block", "fit-content", "flex-row", "flex-column", "grid-auto", "absolute"]) {
    const holder = page.getByTestId(`choices-in-${parent}`)
    const width = (await holder.locator('[data-slot="choice-group"]').boundingBox())!.width
    expect(width, `${parent}: three touch targets`).toBeCloseTo(148, 0)
    const found = await layout(holder)
    expect(found.rows, parent).toEqual([3, 2])
    expect(Math.min(...found.widths), parent).toBeGreaterThanOrEqual(44)
  }
  expect(await pageScroll(page), "the page does not scroll sideways").toBeLessThanOrEqual(phone.width)
  const cell = page.getByTestId("choices-in-table-cell").locator('[data-slot="choice-group"]')
  await cell.evaluate((el) => el.style.setProperty("contain-intrinsic-inline-size", "none"))
  expect((await cell.boundingBox())!.width, "the control: a size container sized by its content is 0px").toBeLessThan(1)
})

// Review N1: a parent that gives the group a width keeps it, at a phone's width too. Asking for a
// full row as its least width, eight sizes ran out of a grid's plain div, a list item and a fieldset.
test("at 375px a choice group takes the width its parent gives, and wraps by the column rule", async ({ page }) => {
  await page.setViewportSize(phone)
  await page.goto("/fixtures.html?fixture=choices-phone")
  for (const [place, rows] of [["grid", [4, 4]], ["grid-1fr", [4, 4]], ["list", [4, 4]], ["fieldset", [4, 4]], ["swatches", [6, 2]]] as const) {
    const holder = page.getByTestId(`choices-place-${place}`)
    const [group, parent] = await holder.locator('[data-slot="choice-group"]').evaluate((el) => [el.getBoundingClientRect().width, el.parentElement!.getBoundingClientRect().width])
    expect(group, `${place}: as wide as its parent`).toBeCloseTo(parent, 0)
    expect(group, `${place}: inside the page`).toBeLessThanOrEqual(phone.width - 32)
    expect((await layout(holder)).rows, place).toEqual([...rows])
  }
  expect(await pageScroll(page), "the page does not scroll sideways").toBeLessThanOrEqual(phone.width)
})

// Review N1: in the registry's own dialog, five sizes asked for a 352px row and scrolled the dialog
// sideways; they lie 3 + 2 in the dialog's width.
test("at 375px a choice group in the registry's dialog wraps inside it", async ({ page }) => {
  await page.setViewportSize(phone)
  await page.goto("/fixtures.html?fixture=choice-dialog")
  const dialog = page.getByRole("dialog", { name: "Taille" })
  const group = dialog.locator('[data-slot="choice-group"]')
  await expect(group).toBeVisible({ timeout: 20_000 })
  expect((await layout(group)).rows).toEqual([3, 2])
  const [scrollWidth, clientWidth] = await dialog.evaluate((el) => [el.scrollWidth, el.clientWidth])
  expect(scrollWidth, "the dialog does not scroll sideways").toBeLessThanOrEqual(clientWidth)
  const [groupRight, dialogRight] = await group.evaluate((el) => [el.getBoundingClientRect().right, el.closest('[role="dialog"]')!.getBoundingClientRect().right])
  expect(groupRight, "inside the dialog").toBeLessThanOrEqual(dialogRight)
})
