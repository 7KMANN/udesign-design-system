import * as React from "react"
import axe from "axe-core"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconButton } from "@/components/ui/icon-button"
import { ResponsiveCollection } from "@/components/ui/responsive-collection"
import { Slider } from "@/components/ui/slider"
import { StatusBadge } from "@/components/ui/status-badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

describe("UDesign registry accessibility contracts", () => {
  it("gives icon actions a required accessible name and touch target", () => {
    render(<IconButton icon={<span aria-hidden="true">+</span>} label="Add record" />)

    const button = screen.getByRole("button", { name: "Add record" })
    expect(button).toHaveClass("size-[var(--touch-target-min)]")
  })

  it("announces busy status without replacing domain text", () => {
    render(<StatusBadge busy tone="progress">Processing</StatusBadge>)

    expect(screen.getByText("Processing")).toHaveAttribute("aria-busy", "true")
  })

  it("keeps mobile and desktop collection renderings explicit", () => {
    render(<ResponsiveCollection desktop={<span>Desktop table</span>} mobile={<span>Mobile cards</span>} />)

    expect(screen.getByText("Mobile cards").parentElement).toHaveClass("md:hidden")
    expect(screen.getByText("Desktop table").parentElement).toHaveClass("hidden", "md:block")
  })

  it("labels scrollable tables as keyboard regions", () => {
    render(
      <Table scrollLabel="Invoice results">
        <TableBody><TableRow><TableCell>Invoice 42</TableCell></TableRow></TableBody>
      </Table>,
    )

    expect(screen.getByRole("region", { name: "Invoice results" })).toHaveAttribute("tabindex", "0")
  })

  it("opens a labeled dialog with a mobile-safe content contract", async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open details</DialogTrigger>
        <DialogContent closeLabel="Close record details">
          <DialogTitle>Record details</DialogTitle>
          <DialogDescription>Review this record.</DialogDescription>
        </DialogContent>
      </Dialog>,
    )

    await user.click(screen.getByRole("button", { name: "Open details" }))
    const dialog = screen.getByRole("dialog", { name: "Record details" })
    expect(dialog).toHaveClass("w-[var(--dialog-inline-size-mobile)]")
    expect(dialog).toHaveClass("max-h-[var(--dialog-block-size-max)]")
    expect(screen.getByRole("button", { name: "Close record details" })).toBeVisible()

    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Open details" })).toHaveFocus()
  })

  it("supports checkbox, switch, and tab keyboard state changes", async () => {
    const user = userEvent.setup()
    render(
      <div>
        <Checkbox aria-label="Include archived" />
        <Switch aria-label="Live updates" />
        <Tabs defaultValue="one">
          <TabsList>
            <TabsTrigger value="one">One</TabsTrigger>
            <TabsTrigger value="two">Two</TabsTrigger>
          </TabsList>
          <TabsContent value="one">First panel</TabsContent>
          <TabsContent value="two">Second panel</TabsContent>
        </Tabs>
      </div>,
    )

    const checkbox = screen.getByRole("checkbox", { name: "Include archived" })
    const toggle = screen.getByRole("switch", { name: "Live updates" })
    await user.click(checkbox)
    await user.click(toggle)
    expect(checkbox).toHaveAttribute("data-state", "checked")
    expect(toggle).toHaveAttribute("data-state", "checked")

    const firstTab = screen.getByRole("tab", { name: "One" })
    const secondTab = screen.getByRole("tab", { name: "Two" })
    firstTab.focus()
    await user.keyboard("{ArrowRight}")
    expect(secondTab).toHaveFocus()
    expect(secondTab).toHaveAttribute("data-state", "active")
  })

  it("gives the slider thumb a keyboard-operable 44px touch target", async () => {
    const user = userEvent.setup()
    render(<Slider aria-label="Volume" defaultValue={[20]} />)

    const thumb = screen.getByRole("slider", { name: "Volume" })
    expect(thumb).toHaveClass("size-[var(--touch-target-min)]")

    thumb.focus()
    await user.keyboard("{ArrowRight}")
    expect(thumb).toHaveAttribute("aria-valuenow", "21")
  })

  it("shows tooltip content from keyboard focus", async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Explain status</TooltipTrigger>
          <TooltipContent>Current semantic state</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    await user.tab()
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Current semantic state")
  })

  it("renders representative controls without axe violations", async () => {
    const { container } = render(
      <main>
        <h1>Registry preview</h1>
        <label>Accept terms <Checkbox /></label>
        <Switch aria-label="Live updates" />
        <IconButton icon={<span aria-hidden="true">+</span>} label="Add record" />
        <StatusBadge tone="success">Complete</StatusBadge>
        <Tabs defaultValue="one"><TabsList><TabsTrigger value="one">One</TabsTrigger></TabsList><TabsContent value="one">Panel</TabsContent></Tabs>
      </main>,
    )

    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})
