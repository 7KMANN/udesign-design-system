import * as React from "react"
import axe from "axe-core"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { OperationsQueue } from "../../examples/operations-queue"
import { PresentationOrder } from "../../examples/presentation-order"

// The reference screens are what agents copy (plan Phase 5), so they meet the same bar as the registry.
describe("reference screens", () => {
  it.each([
    ["presentation", PresentationOrder],
    ["operations", OperationsQueue],
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
})
