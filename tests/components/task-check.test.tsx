import * as React from "react"
import axe from "axe-core"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { TaskCheck } from "@/components/ui/task-check"

// The tick of the task tool scenario (D-65). Controlled: the row owns the state.
function Controlled({ hue = "day" as const, onChange = (_: boolean) => {} }) {
  const [checked, setChecked] = React.useState(false)
  return (
    <div data-scenario="task">
      <TaskCheck
        checked={checked}
        hue={hue}
        aria-label="Order DTF film"
        onCheckedChange={(value) => {
          setChecked(value)
          onChange(value)
        }}
      />
    </div>
  )
}

describe("TaskCheck", () => {
  it("renders a checkbox with aria-checked", async () => {
    const { container } = render(<Controlled />)
    const box = screen.getByRole("checkbox", { name: "Order DTF film" })
    expect(box).toHaveAttribute("aria-checked", "false")
    expect((await axe.run(container)).violations).toEqual([])
  })

  it("toggles on click and on Space", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Controlled onChange={onChange} />)
    const box = screen.getByRole("checkbox", { name: "Order DTF film" })

    await user.click(box)
    expect(box).toHaveAttribute("aria-checked", "true")
    expect(box).toHaveAttribute("data-state", "checked")
    expect(onChange).toHaveBeenLastCalledWith(true)

    box.focus()
    await user.keyboard(" ")
    expect(box).toHaveAttribute("aria-checked", "false")
    expect(onChange).toHaveBeenLastCalledWith(false)
  })

  it("uses the list hue", () => {
    const { rerender } = render(<TaskCheck checked={false} onCheckedChange={() => {}} hue="dev" aria-label="Ship the repin" />)
    const box = screen.getByRole("checkbox", { name: "Ship the repin" })
    expect(box).toHaveAttribute("data-hue", "dev")
    expect(box.className).toContain("[--task-check-hue:var(--task-cat-dev)]")
    // Ring and fill read the hue; the glyph on the fill reads --task-cat-on.
    const mark = box.querySelector("span")!
    expect(mark.className).toContain("border-[color:var(--task-check-hue)]")
    expect(mark.className).toContain("group-data-[state=checked]:bg-[var(--task-check-hue)]")
    expect(mark.className).toContain("text-[color:var(--task-cat-on)]")

    rerender(<TaskCheck checked onCheckedChange={() => {}} hue="business" aria-label="Ship the repin" />)
    expect(box.className).toContain("[--task-check-hue:var(--task-cat-business)]")
    expect(box.className).not.toContain("--task-cat-dev")
  })

  it("shows the check at once under reduced motion", () => {
    render(<TaskCheck checked onCheckedChange={() => {}} hue="ideas" aria-label="Sketch the spring line" />)
    const path = screen.getByRole("checkbox", { name: "Sketch the spring line" }).querySelector("path")!
    // The stroke draws over --task-hold, which the tokens set to 0ms under reduced motion,
    // and the transition itself is dropped there, so the check is simply on.
    expect(path.getAttribute("class")).toContain("duration-[var(--task-hold)]")
    expect(path.getAttribute("class")).toContain("motion-reduce:transition-none")
    expect(path.getAttribute("class")).toContain("group-data-[state=checked]:[stroke-dashoffset:0]")
  })

  it("is the row's tab stop with the touch floor as its target, and keeps a caller's class", () => {
    render(<TaskCheck checked={false} onCheckedChange={() => {}} hue="day" aria-label="Call the bank" className="tt-check" />)
    const box = screen.getByRole("checkbox", { name: "Call the bank" })
    expect(box.tagName).toBe("BUTTON")
    expect(box.className).toContain("size-[var(--task-hit)]")
    expect(box.className).toContain("focus-visible:outline-[color:var(--interactive-focus)]")
    expect(box.className.trim().endsWith("tt-check")).toBe(true)
  })
})
