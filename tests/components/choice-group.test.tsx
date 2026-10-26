import * as React from "react"
import fs from "node:fs"
import path from "node:path"
import axe from "axe-core"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { CHOICE_RANGES, ChoiceGroup, choiceColumns, type Choice } from "@/components/ui/choice-group"

const sizes = (...labels: string[]): Choice[] => labels.map((label) => ({ value: label, label }))
const range = (from: number) => CHOICE_RANGES.find((r) => r.from === from)!
// Rows a layout makes, and how many choices sit on the last one.
const rows = (count: number, columns: number) => ({ rows: Math.ceil(count / columns), last: count - (Math.ceil(count / columns) - 1) * columns })

// D-49: explicit columns. One row when every choice gets 4rem; otherwise rows of one count, the
// last at most one shorter, never one choice alone, and never a cell under the touch target.
describe("choiceColumns", () => {
  it("lays one row when every choice gets 4rem", () => {
    for (const r of CHOICE_RANGES) for (let n = 1; n <= r.fit; n += 1) expect(choiceColumns(n, r)).toBe(n)
  })

  it("lays Boutique's sizes as its standard says at 375px: 5 as 3 + 2, 6 as 3 + 3, 7 as 4 + 3", () => {
    const phone = range(13)
    expect([5, 6, 7].map((n) => choiceColumns(n, phone))).toEqual([3, 3, 4])
  })

  it("takes the fewest even rows, and narrower cells only where 4rem leaves none", () => {
    expect(choiceColumns(10, range(17.5))).toBe(5) // 5 + 5, not 2 x 5
    expect(choiceColumns(8, range(13))).toBe(4) // 4 + 4
    expect(choiceColumns(4, range(13))).toBe(2) // 2 + 2: one row of 4 would give cells under 4rem
    expect(choiceColumns(3, range(9.25))).toBe(3) // one row of touch-sized cells, the only even layout
    expect(choiceColumns(3, range(8.5))).toBe(2) // too narrow for three: a lone last choice is left
    expect(choiceColumns(13, range(53.5))).toBe(7) // 7 + 6 at the widest range
  })

  it("never leaves a choice alone where another layout keeps the touch target, and never goes under it", () => {
    for (const r of CHOICE_RANGES) {
      for (let n = 1; n <= 16; n += 1) {
        const columns = choiceColumns(n, r)
        expect(columns).toBeGreaterThanOrEqual(1)
        expect(columns).toBeLessThanOrEqual(Math.min(n, r.most))
        if (r.from > 0) expect((r.from - (columns - 1) * 0.5) / columns, `${n} in ${r.from}rem`).toBeGreaterThanOrEqual(2.75)
        const { rows: count, last } = rows(n, columns)
        const even = (c: number) => rows(n, c).last >= c - 1 && rows(n, c).last >= 2
        const evenAt4rem = Array.from({ length: Math.max(0, Math.min(r.fit, n - 1) - 1) }, (_, i) => i + 2).some(even)
        if (count > 1 && evenAt4rem) expect(even(columns), `${n} in ${r.from}rem: rows of one count, the last at most one shorter`).toBe(true)
        if (count > 1 && last === 1) {
          for (let c = 2; c <= Math.min(r.most, n); c += 1) expect(rows(n, c).last, `${n} in ${r.from}rem could avoid a lone choice with ${c}`).toBe(1)
        }
      }
    }
  })

  it("agrees with the container queries the stylesheet ships", () => {
    const css = fs.readFileSync(path.resolve(__dirname, "../../dist/tokens.css"), "utf8")
    const queries = [...css.matchAll(/@container \(min-width: ([\d.]+)rem\) \{ \[data-slot="choice-group-items"\]\[data-variant="button"\] \{ grid-template-columns: repeat\(var\(--choice-columns-(\d+), 1\)/g)]
    expect(queries.map((m) => [Number(m[1]), Number(m[2])])).toEqual(CHOICE_RANGES.slice(1).map((r, i) => [r.from, i + 2]))
    expect(css).toMatch(/\[data-slot="choice-group-items"\]\[data-variant="button"\] \{ grid-template-columns: repeat\(var\(--choice-columns-1, 1\)/)
    expect(css).toMatch(/\[data-slot="choice-group"\] \{ container-type: inline-size; \}/)
  })
})

describe("ChoiceGroup", () => {
  const listeners: Array<(e: KeyboardEvent) => void> = []
  afterEach(() => {
    for (const l of listeners.splice(0)) document.removeEventListener("keydown", l)
  })

  function Sizes(props: Partial<React.ComponentProps<typeof ChoiceGroup>>) {
    const [value, setValue] = React.useState<string | null>(props.value ?? null)
    return (
      <ChoiceGroup
        aria-label="Taille"
        choices={[...sizes("S", "M", "L"), { value: "XL", label: "XL", disabled: true }, ...sizes("2XL")]}
        unavailableLabel="non disponible"
        {...props}
        value={value}
        onValueChange={setValue}
      />
    )
  }

  it("is a radio group of buttons that each hold their label alone, with one Tab stop", () => {
    render(<Sizes value="L" />)
    const group = screen.getByRole("radiogroup", { name: "Taille" })
    const radios = screen.getAllByRole("radio")
    expect(radios.map((r) => r.textContent)).toEqual(["S", "M", "L", "XL, non disponible", "2XL"])
    expect(radios.map((r) => r.tabIndex)).toEqual([-1, -1, 0, -1, -1])
    expect(screen.getByRole("radio", { name: "L" })).toHaveAttribute("aria-checked", "true")
    expect(group).not.toHaveAttribute("aria-describedby")
  })

  it("puts the Tab stop on the first choice that can be had when none is chosen", () => {
    render(<ChoiceGroup aria-label="Taille" choices={[{ value: "S", label: "S", disabled: true }, ...sizes("M", "L")]} />)
    expect(screen.getAllByRole("radio").map((r) => r.tabIndex)).toEqual([-1, 0, -1])
  })

  it("says in words that a choice cannot be had, besides disabling and striking it", () => {
    render(<Sizes />)
    const xl = screen.getByRole("radio", { name: "XL, non disponible" })
    expect(xl).toBeDisabled()
    expect(xl.firstElementChild).toHaveClass("line-through")
    expect(xl).toHaveClass("disabled:border-dashed", "disabled:bg-[var(--interactive-disabled)]", "disabled:text-[var(--interactive-disabled-foreground)]")
  })

  it("moves and chooses with the arrow keys, skipping what cannot be had, and stops them there", async () => {
    const user = userEvent.setup()
    render(<Sizes value="L" />)
    await user.tab()
    expect(screen.getByRole("radio", { name: "L" })).toHaveFocus()
    const page = vi.fn()
    const listen = (e: KeyboardEvent) => page(e.key)
    listeners.push(listen)
    document.addEventListener("keydown", listen)
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("radio", { name: "2XL" })).toHaveFocus()
    expect(screen.getByRole("radio", { name: "2XL" })).toHaveAttribute("aria-checked", "true")
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("radio", { name: "S" })).toHaveAttribute("aria-checked", "true")
    await user.keyboard("{ArrowLeft}{ArrowUp}")
    expect(screen.getByRole("radio", { name: "L" })).toHaveAttribute("aria-checked", "true")
    await user.keyboard("{End}")
    expect(screen.getByRole("radio", { name: "2XL" })).toHaveFocus()
    await user.keyboard("{Home}")
    expect(screen.getByRole("radio", { name: "S" })).toHaveFocus()
    // A page-level listener, such as a gallery's, never saw an arrow the group handled.
    expect(page).not.toHaveBeenCalled()
    await user.keyboard("a")
    expect(page).toHaveBeenCalledWith("a")
  })

  it("ties the note under the group to it, and renders no note when there is none", () => {
    render(<Sizes note="2XL : +2 $ · Non disponible en Pigment Black : XL" />)
    const group = screen.getByRole("radiogroup", { name: "Taille" })
    const note = screen.getByText("2XL : +2 $ · Non disponible en Pigment Black : XL")
    expect(group.getAttribute("aria-describedby")).toBe(note.id)
    expect(group).toHaveAccessibleDescription("2XL : +2 $ · Non disponible en Pigment Black : XL")
  })

  it("writes the columns of every range for its number of choices", () => {
    render(<ChoiceGroup aria-label="Taille" choices={sizes("XS", "S", "M", "L", "XL", "2XL", "3XL")} />)
    const items = screen.getByRole("radiogroup")
    const written = CHOICE_RANGES.map((_, i) => Number(items.style.getPropertyValue(`--choice-columns-${i + 1}`)))
    expect(written).toEqual(CHOICE_RANGES.map((r) => choiceColumns(7, r)))
    expect(items).toHaveAttribute("data-variant", "button")
    expect(items.parentElement).toHaveAttribute("data-slot", "choice-group")
  })

  it("shows swatches by their colour and names them in words", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <ChoiceGroup
        aria-label="Couleur"
        variant="swatch"
        defaultValue="Bone"
        onValueChange={onValueChange}
        unavailableLabel="non disponible"
        choices={[
          { value: "Bone", label: "Bone", swatch: "#e8dfcf" },
          { value: "Pigment Black", label: "Pigment Black", swatch: "#2b2b2b", disabled: true },
          { value: "Navy", label: "Navy", swatch: "#1f2a44" },
        ]}
      />,
    )
    expect(screen.getByRole("radio", { name: "Bone" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("radio", { name: "Pigment Black, non disponible" })).toBeDisabled()
    expect(screen.getByRole("radiogroup")).toHaveClass("flex", "flex-wrap")
    expect(screen.getByRole("radiogroup").style.getPropertyValue("--choice-columns-1")).toBe("")
    const navy = screen.getByRole("radio", { name: "Navy" })
    expect((navy.firstElementChild as HTMLElement).style.getPropertyValue("--choice-swatch")).toBe("#1f2a44")
    await user.click(navy)
    expect(onValueChange).toHaveBeenCalledWith("Navy")
    expect(navy).toHaveAttribute("aria-checked", "true")
  })

  it("disables every choice while the group is disabled, and submits its value with a form", () => {
    const { rerender } = render(<ChoiceGroup aria-label="Taille" name="size" value="M" choices={sizes("S", "M")} />)
    expect(document.querySelector<HTMLInputElement>('input[type="hidden"][name="size"]')?.value).toBe("M")
    rerender(<ChoiceGroup aria-label="Taille" name="size" value="M" disabled choices={sizes("S", "M")} />)
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled()
    expect(screen.getByRole("radio", { name: "M" })).toHaveAccessibleName("M")
  })

  it("presses, eases its press under Tailwind 3 and 4, and shows focus", () => {
    render(<Sizes />)
    expect(screen.getByRole("radio", { name: "S" })).toHaveClass(
      "active:scale-[var(--motion-press-scale)]",
      "active:bg-[var(--interactive-pressed)]",
      "transition-[transform,scale,background-color,border-color]",
      "focus-visible:outline-[color:var(--interactive-focus)]",
      "aria-checked:border-[var(--interactive-selected-border)]",
    )
  })

  it("renders without axe violations, a note and a choice that cannot be had included", async () => {
    const { container } = render(
      <main>
        <p id="size-label">Taille</p>
        <Sizes aria-label={undefined} aria-labelledby="size-label" value="M" note="Non disponible en Pigment Black : XL" />
      </main>,
    )
    expect(screen.getByRole("radiogroup", { name: "Taille" })).toBeInTheDocument()
    expect((await axe.run(container)).violations).toEqual([])
  })
})
