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
