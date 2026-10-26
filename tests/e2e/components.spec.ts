import { expect, test, type Locator } from "@playwright/test"

// Registry components measured where jsdom cannot lay out, on showcase/fixtures.html.

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
