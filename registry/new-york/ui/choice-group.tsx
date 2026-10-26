"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface Choice {
  /** What onValueChange receives. */
  value: string
  /** The button's words, its whole content and its accessible name. A swatch shows its colour and keeps the words for a screen reader. */
  label: string
  /** Cannot be chosen: disabled, dashed and struck through, and its name says so in words (unavailableLabel). Say why in the note. */
  disabled?: boolean
  /** A swatch's colour, as any CSS background: the product's own colour, or a pattern for a plaid. Product data, which ban 3 allows. */
  swatch?: string
}

export interface ChoiceGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  choices: Choice[]
  /** The chosen value, controlled. null: nothing chosen yet. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string) => void
  /** button (default): labelled buttons in explicit columns, for sizes and options. swatch: round colour swatches in a row that wraps. */
  variant?: "button" | "swatch"
  /** The line under the group, tied to it by aria-describedby: what the buttons do not carry, such as a surcharge or what cannot be had. */
  note?: React.ReactNode
  /** Words a choice that cannot be had adds to its name. English by default: pass the interface's language (fr-CA first). */
  unavailableLabel?: string
  /** Disables every choice, for example while the choice saves. */
  disabled?: boolean
  /** Submits the value with a form, through a hidden input. */
  name?: string
}

// Explicit columns (DESIGN.md "Choosing one of a few"). A cell gets 4rem in one row, the cells
// sit 0.5rem apart, and a cell never falls under the 2.75rem touch target. Each range below
// starts where one more cell fits; css/registry.css holds the same widths as container
// queries, and reads --choice-columns-N, which the group writes for its number of choices.
export interface ChoiceRange {
  /** Container width, in rem, from which the range applies. */
  from: number
  /** How many 4rem cells fit. */
  fit: number
  /** The most columns whose cells keep the touch target: one more than fit from 3 cells up. */
  most: number
}

const MAX_COLUMNS = 12
export const CHOICE_RANGES: ChoiceRange[] = [
  { from: 0, fit: 1, most: 1 },
  { from: 8.5, fit: 2, most: 2 },
  { from: 9.25, fit: 2, most: 3 },
  ...Array.from({ length: MAX_COLUMNS - 2 }, (_, i) => ({ from: 4.5 * (i + 3) - 0.5, fit: i + 3, most: Math.min(i + 4, MAX_COLUMNS) })),
]

/**
 * The columns for `count` choices in a range. One row when every choice gets 4rem. Otherwise
 * rows of one count, the last at most one shorter, never one choice alone on a row, in the
 * fewest rows. Only where no such rows exist at 4rem does a row get narrower cells, never
 * under the touch target; a lone last choice is left only where nothing else fits.
 */
export function choiceColumns(count: number, { fit, most }: ChoiceRange): number {
  if (count <= fit) return Math.max(count, 1)
  const last = (columns: number) => count - (Math.ceil(count / columns) - 1) * columns
  const fewestRows = (keep: (columns: number) => boolean) => {
    for (let columns = Math.min(most, count - 1); columns >= 2; columns -= 1) if (keep(columns)) return columns
    return 0
  }
  return (
    fewestRows((c) => last(c) >= c - 1 && last(c) >= 2) ||
    (count <= most ? count : 0) ||
    fewestRows((c) => last(c) >= 2) ||
    Math.max(Math.min(most, count), 1)
  )
}

const STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

// A labelled choice: one label, centred, a control's height. Chosen changes the boundary and the
// surface, never the colour alone; a choice that cannot be had keeps a readable label.
const buttonClass =
  "flex h-[var(--control-height)] min-h-[var(--touch-target-min)] min-w-0 items-center justify-center rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--card)] px-1 text-center text-sm font-semibold leading-tight text-[var(--card-foreground)] hover:bg-[var(--interactive-hover)] active:bg-[var(--interactive-pressed)] aria-checked:border-[var(--interactive-selected-border)] aria-checked:bg-[var(--interactive-selected)] aria-checked:text-[var(--interactive-selected-foreground)] aria-checked:ring-1 aria-checked:ring-inset aria-checked:ring-[var(--interactive-selected-border)] disabled:border-dashed disabled:bg-[var(--interactive-disabled)] disabled:text-[var(--interactive-disabled-foreground)]"

// A swatch: the colour in a touch target, its name for a screen reader. Chosen draws a ring.
const swatchClass =
  "inline-flex size-[var(--touch-target-min)] shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--card)] hover:bg-[var(--interactive-hover)] active:bg-[var(--interactive-pressed)] aria-checked:border-[var(--interactive-selected-border)] aria-checked:ring-2 aria-checked:ring-[var(--interactive-selected-border)] disabled:border-dashed"

const ChoiceGroup = React.forwardRef<HTMLDivElement, ChoiceGroupProps>(
  (
    {
      "aria-describedby": describedBy,
      "aria-label": label,
      "aria-labelledby": labelledBy,
      choices,
      className,
      defaultValue = null,
      disabled = false,
      name,
      note,
      onValueChange,
      unavailableLabel = "unavailable",
      value: valueProp,
      variant = "button",
      ...props
    },
    ref,
  ) => {
    const [own, setOwn] = React.useState<string | null>(defaultValue)
    const value = valueProp === undefined ? own : valueProp
    const noteId = React.useId()
    const buttons = React.useRef(new Map<string, HTMLButtonElement>())

    const open = disabled ? [] : choices.filter((c) => !c.disabled)
    const chosen = value !== null && open.some((c) => c.value === value) ? value : null
    // One Tab stop: the chosen choice, or the first that can be chosen.
    const stop = chosen ?? open[0]?.value

    const choose = (next: string) => {
      if (valueProp === undefined) setOwn(next)
      onValueChange?.(next)
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      const step = STEP[event.key]
      if (!step && event.key !== "Home" && event.key !== "End") return
      const at = open.findIndex((c) => buttons.current.get(c.value) === event.target)
      if (at < 0) return
      // Handled and stopped here: a listener on the page, such as a gallery's, never sees the key.
      event.preventDefault()
      event.stopPropagation()
      const next = open[event.key === "Home" ? 0 : event.key === "End" ? open.length - 1 : (at + step + open.length) % open.length]
      buttons.current.get(next.value)?.focus()
      if (next.value !== chosen) choose(next.value)
    }

    const columns =
      variant === "button"
        ? (Object.fromEntries(CHOICE_RANGES.map((range, i) => [`--choice-columns-${i + 1}`, choiceColumns(choices.length, range)])) as React.CSSProperties)
        : undefined

    return (
      <div ref={ref} data-slot="choice-group" className={cn("grid w-full min-w-0 gap-2", className)} {...props}>
        <div
          role="radiogroup"
          data-slot="choice-group-items"
          data-variant={variant}
          aria-label={label}
          aria-labelledby={labelledBy}
          aria-describedby={[describedBy, note ? noteId : null].filter(Boolean).join(" ") || undefined}
          aria-disabled={disabled || undefined}
          onKeyDown={onKeyDown}
          className={variant === "swatch" ? "flex flex-wrap gap-2" : "grid gap-2"}
          style={columns}
        >
          {choices.map((choice) => {
            const unavailable = Boolean(choice.disabled)
            return (
              <button
                key={choice.value}
                ref={(el) => {
                  if (el) buttons.current.set(choice.value, el)
                  else buttons.current.delete(choice.value)
                }}
                type="button"
                role="radio"
                aria-checked={choice.value === chosen}
                disabled={unavailable || disabled}
                tabIndex={choice.value === stop ? 0 : -1}
                onClick={() => choose(choice.value)}
                // Every choice: a press that eases under Tailwind 3 and 4, and a ring for the keyboard.
                className={cn(
                  "relative transition-[transform,scale,background-color,border-color] duration-[var(--motion-duration-instant)] ease-[var(--motion-easing-standard)] active:scale-[var(--motion-press-scale)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--interactive-focus)] disabled:cursor-not-allowed disabled:active:scale-100",
                  variant === "swatch" ? swatchClass : buttonClass,
                )}
              >
                {variant === "swatch" ? (
                  <>
                    {/* design-ok: the product colour's own swatch, from the consumer's data. */}
                    <span aria-hidden="true" className="size-7 rounded-full border border-[var(--border-strong)] [background:var(--choice-swatch)]" style={{ "--choice-swatch": choice.swatch } as React.CSSProperties} />
                    {unavailable ? <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-0.5 w-9 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-[var(--interactive-disabled-foreground)]" /> : null}
                    <span className="sr-only">{unavailable ? `${choice.label}, ${unavailableLabel}` : choice.label}</span>
                  </>
                ) : (
                  <>
                    <span className={cn("min-w-0 [overflow-wrap:anywhere]", unavailable && "line-through")}>{choice.label}</span>
                    {unavailable ? <span className="sr-only">, {unavailableLabel}</span> : null}
                  </>
                )}
              </button>
            )
          })}
        </div>
        {note ? (
          <p id={noteId} data-slot="choice-group-note" className="text-sm leading-relaxed text-[var(--muted-foreground)]">
            {note}
          </p>
        ) : null}
        {name ? <input type="hidden" name={name} value={chosen ?? ""} /> : null}
      </div>
    )
  },
)
ChoiceGroup.displayName = "ChoiceGroup"

export { ChoiceGroup }
