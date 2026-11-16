import * as React from "react"
import axe from "axe-core"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { OperationsQueue } from "../../examples/operations-queue"
import { PresentationOrder } from "../../examples/presentation-order"
import { TaskToolToday } from "../../examples/task-tool-today"

// The reference screens are what agents copy (plan Phase 5), so they meet the same bar as the registry.
describe("reference screens", () => {
  it.each([
    ["presentation", PresentationOrder],
    ["operations", OperationsQueue],
    ["task tool", TaskToolToday],
  ])("the %s screen renders without axe violations", async (_, Screen) => {
    const { container } = render(<Screen />)
    expect((await axe.run(container)).violations).toEqual([])
  })

  it("the operations toolbar filter reports its state and filters the queue", async () => {
    render(<OperationsQueue />)
    const dtf = screen.getByRole("button", { name: "DTF" })
    await userEvent.click(dtf)
    expect(dtf).toHaveAttribute("aria-pressed", "true")
    expect(screen.queryByRole("button", { name: "Ouvrir UD-1036" })).toBeNull()
    expect(screen.getByRole("button", { name: "Ouvrir UD-1038" })).toBeInTheDocument()
  })

  it("the task tool screen ticks a row, holds it for undo, and keeps Dev questions apart", async () => {
    // The undo window is a token; give the region the shipped values the stylesheet would.
    const style = document.createElement("style")
    style.textContent = '[data-scenario="task"] { --task-undo-window: 3s; --task-hold: 0ms; --task-leave: 0ms; }'
    document.head.appendChild(style)
    const user = userEvent.setup()
    render(<TaskToolToday />)
    expect(screen.getByRole("heading", { name: "Waiting on you" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Dev questions" })).toBeInTheDocument()
    expect(screen.getByRole("article", { name: "Question from KASPER" }).closest("section")).toHaveAttribute("aria-labelledby", "dev-asks-title")

    await user.click(screen.getByRole("checkbox", { name: "Order transfer film" }))
    expect(screen.getByRole("status")).toHaveTextContent("Done: Order transfer film")
    await user.click(screen.getByRole("button", { name: "Undo" }))
    expect(screen.getByRole("checkbox", { name: "Order transfer film" })).toHaveAttribute("aria-checked", "false")
    expect(screen.getByRole("status")).toHaveTextContent("")
    style.remove()
  })
})
