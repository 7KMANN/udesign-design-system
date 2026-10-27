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

  it("keeps rows of one count unless they cost two rows over filling, never leaves a choice alone it could help, never goes under the touch target", () => {
    for (const r of CHOICE_RANGES) {
      for (let n = 1; n <= 40; n += 1) {
        const columns = choiceColumns(n, r)
        const where = `${n} in ${r.from}rem`
        expect(columns).toBeGreaterThanOrEqual(1)
        expect(columns).toBeLessThanOrEqual(Math.min(n, r.most))
        if (r.from > 0) expect((r.from - (columns - 1) * 0.5) / columns, where).toBeGreaterThanOrEqual(2.75)
        const { rows: count, last } = rows(n, columns)
        const candidates = Array.from({ length: Math.max(0, Math.min(r.most, n - 1) - 1) }, (_, i) => i + 2)
        const even = (c: number) => rows(n, c).last >= c - 1 && rows(n, c).last >= 2
        const fewest = (keep: (c: number) => boolean) => Math.min(Infinity, ...candidates.filter(keep).map((c) => rows(n, c).rows))
        const evenRows = fewest(even)
        const filledRows = fewest((c) => rows(n, c).last >= 2)
        if (count > 1 && evenRows < Infinity && evenRows <= filledRows + 1) expect([even(columns), count], `${where}: rows of one count, the last at most one shorter`).toEqual([true, evenRows])
        if (count > 1 && filledRows < Infinity) expect(count, `${where}: at most one row more than filling the rows`).toBeLessThanOrEqual(filledRows + 1)
        if (count > 1 && last === 1) {
          for (let c = 2; c <= Math.min(r.most, n); c += 1) expect(rows(n, c).last, `${where} could avoid a lone choice with ${c}`).toBe(1)
        }
      }
    }
  })

  // Review M6: a long list fills its rows instead of standing in eleven rows of two.
  it("fills the rows of a long list at a phone's width", () => {
    const phone = range(17.5) // a 343px group
    expect([20, 22, 24].map((n) => [choiceColumns(n, phone), rows(n, choiceColumns(n, phone)).rows])).toEqual([[5, 4], [5, 5], [5, 5]])
    expect(choiceColumns(10, range(13)), "4 + 4 + 2 rather than five rows of two").toBe(4)
  })

  it("agrees with the container queries the stylesheet ships", () => {
    const css = fs.readFileSync(path.resolve(__dirname, "../../dist/tokens.css"), "utf8")
    const queries = [...css.matchAll(/@container \(min-width: ([\d.]+)rem\) \{ \[data-slot="choice-group-items"\]\[data-variant="button"\] \{ grid-template-columns: repeat\(var\(--choice-columns-(\d+), 1\)/g)]
    expect(queries.map((m) => [Number(m[1]), Number(m[2])])).toEqual(CHOICE_RANGES.slice(1).map((r, i) => [r.from, i + 2]))
    expect(css).toMatch(/\[data-slot="choice-group-items"\]\[data-variant="button"\] \{ grid-template-columns: repeat\(var\(--choice-columns-1, 1\)/)
    expect(css).toMatch(/\[data-slot="choice-group"\] \{ container-type: inline-size; contain-intrinsic-inline-size: var\(--choice-intrinsic, 9\.25rem\); \}/)
    // D-59: rows read no column query, so the group is no size container there (review M3).
    expect(css).toMatch(/\[data-slot="choice-group"\]\[data-variant="rows"\] \{ container-type: normal; \}/)
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
    // Named in order by their labels; an unavailable one's name is one box, its label and the words.
    expect(radios).toEqual(["S", "M", "L", "XL, non disponible", "2XL"].map((name) => screen.getByRole("radio", { name })))
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
    expect(xl).toHaveAttribute("data-unavailable", "true")
    expect(xl).toHaveClass("data-[unavailable=true]:border-dashed", "disabled:aria-[checked=false]:bg-[var(--interactive-disabled)]", "disabled:aria-[checked=false]:text-[var(--interactive-disabled-foreground)]")
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

  // Review N1: what it asks for where its parent's width comes from its content is also its least
  // width, so it is three touch targets at most, never a full row of its choices.
  it("asks for three touch targets at most where its parent's width comes from its content", () => {
    const asked = (count: number, variant?: "swatch") => {
      const choices = Array.from({ length: count }, (_, i) => ({ value: `${i}`, label: `${i}`, swatch: variant && "white" }))
      const { container, unmount } = render(<ChoiceGroup aria-label="Taille" variant={variant} choices={choices} />)
      const value = (container.firstElementChild as HTMLElement).style.getPropertyValue("--choice-intrinsic")
      unmount()
      return value
    }
    expect([1, 2, 3, 5, 12].map((n) => asked(n))).toEqual(["4rem", "8.5rem", "9.25rem", "9.25rem", "9.25rem"])
    expect([1, 2, 3, 8].map((n) => asked(n, "swatch"))).toEqual(["2.75rem", "6rem", "9.25rem", "9.25rem"])
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

  // Review I1: the group's disabled holds the choice while it saves; the look is measured in Chromium.
  it("keeps its choice while disabled, and posts as a native radio group: the value, or nothing", () => {
    const group = (props: Partial<React.ComponentProps<typeof ChoiceGroup>>) => (
      <form data-testid="form">
        <ChoiceGroup aria-label="Taille" name="size" choices={sizes("S", "M", "L")} {...props} />
      </form>
    )
    const posted = () => [...new FormData(screen.getByTestId("form") as HTMLFormElement).entries()]
    const { rerender } = render(group({ value: "M" }))
    expect(posted()).toEqual([["size", "M"]])
    rerender(group({ value: "M", disabled: true }))
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled()
    expect(screen.getAllByRole("radio").map((r) => r.getAttribute("aria-checked"))).toEqual(["false", "true", "false"])
    expect(screen.getByRole("radio", { name: "M" })).not.toHaveAttribute("data-unavailable")
    expect(screen.getByRole("radio", { name: "M" })).toHaveAccessibleName("M")
    expect(posted(), "a disabled group posts nothing").toEqual([])
    rerender(group({ value: null }))
    expect(posted(), "nothing chosen posts nothing, never an empty value").toEqual([])
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

// D-59: options a participant chooses by their detail, such as each option's price, are rows: a
// radio mark, the label at the start, the detail at the end, one row per choice at every width
// (Boutique's move to v3.3.0: its hoodie's options lost their prices as side-by-side buttons).
describe("ChoiceGroup rows", () => {
  const options = [
    { value: "both", label: "Broderie devant et dos", detail: "79 $" },
    { value: "front", label: "Broderie devant seulement", detail: "53 $" },
    { value: "back", label: "Broderie au dos seulement", detail: "59 $", disabled: true },
  ]
  function Options(props: Partial<React.ComponentProps<typeof ChoiceGroup>>) {
    const [value, setValue] = React.useState<string | null>(props.value ?? null)
    return <ChoiceGroup aria-label="Option" variant="rows" choices={options} unavailableLabel="non disponible" {...props} value={value} onValueChange={setValue} />
  }

  it("names each row by its label and its detail, and an unavailable one in words", () => {
    render(<Options value="front" />)
    const radios = screen.getAllByRole("radio")
    expect(radios).toEqual(["Broderie devant et dos, 79 $", "Broderie devant seulement, 53 $", "Broderie au dos seulement, 59 $, non disponible"].map((name) => screen.getByRole("radio", { name })))
    expect(radios.map((r) => r.tabIndex), "one Tab stop, the chosen row").toEqual([-1, 0, -1])
    expect(screen.getByRole("radio", { name: /devant seulement/ })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("radio", { name: /au dos/ })).toBeDisabled()
  })

  it("lays one row per choice, the label at the start and the detail at the end", () => {
    render(<Options />)
    const items = screen.getByRole("radiogroup")
    expect(items).toHaveAttribute("data-variant", "rows")
    expect(items.parentElement).toHaveAttribute("data-variant", "rows")
    expect(items).toHaveClass("grid")
    expect(items.style.getPropertyValue("--choice-columns-1"), "no columns: a row each").toBe("")
    const row = screen.getByRole("radio", { name: /devant et dos/ })
    expect(row).toHaveClass("w-full", "text-start", "active:scale-[var(--motion-press-scale-subtle)]")
    expect(row, "a row presses with the subtle scale, as a wide surface does").not.toHaveClass("active:scale-[var(--motion-press-scale)]")
    const [mark, label, detail] = [...row.children]
    expect(mark).toHaveAttribute("aria-hidden", "true")
    expect(label).toHaveAttribute("data-slot", "choice-label")
    expect(label).toHaveClass("flex-1", "[overflow-wrap:anywhere]")
    expect(detail).toHaveAttribute("data-slot", "choice-detail")
    // A figure: the numeric pair, semibold, at the row's end (review I1, M11).
    expect(detail).toHaveClass("ms-auto", "text-end", "font-semibold", "[font-family:var(--font-numeric)]", "[font-variant-numeric:var(--font-numeric-variant)]")
    expect(detail).toHaveTextContent("79 $")
    expect(screen.getByRole("radio", { name: /au dos/ }).querySelector('[data-slot="choice-label"]')).toHaveClass("line-through")
  })

  // Review I3: a falsy detail, what `price !== null && price` gives, is no detail at all.
  it("reads a node detail, and adds nothing for none, false or an empty one", () => {
    render(
      <ChoiceGroup
        aria-label="Détails"
        variant="rows"
        choices={[
          { value: "node", label: "Un nœud", detail: <span><s>89 $</s> 79 $</span> },
          { value: "none", label: "Sans détail" },
          { value: "false", label: "Détail faux", detail: false },
          { value: "empty", label: "Détail vide", detail: "" },
          { value: "zero", label: "Gratuit", detail: 0 },
        ]}
      />,
    )
    const radios = screen.getAllByRole("radio")
    expect(radios).toEqual(["Un nœud, 89 $ 79 $", "Sans détail", "Détail faux", "Détail vide", "Gratuit, 0"].map((name) => screen.getByRole("radio", { name })))
    expect(radios.map((r) => r.querySelectorAll('[data-slot="choice-detail"]').length), "a detail box only for a detail").toEqual([1, 0, 0, 0, 1])
  })

  it("moves and chooses with the arrow keys, skipping what cannot be had, and stops them there", async () => {
    const user = userEvent.setup()
    const onKeyDown = vi.fn()
    render(
      <div onKeyDown={onKeyDown}>
        <Options />
      </div>,
    )
    await user.tab()
    expect(screen.getByRole("radio", { name: /devant et dos/ })).toHaveFocus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("radio", { name: /devant seulement/ })).toHaveFocus()
    expect(screen.getByRole("radio", { name: /devant seulement/ })).toHaveAttribute("aria-checked", "true")
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("radio", { name: /devant et dos/ }), "the unavailable row is skipped").toHaveFocus()
    expect(onKeyDown, "the group stops the keys it handles").not.toHaveBeenCalled()
  })

  it("renders without axe violations", async () => {
    const { container } = render(<Options value="both" note="Le prix comprend la broderie." />)
    expect((await axe.run(container)).violations).toEqual([])
  })
})
