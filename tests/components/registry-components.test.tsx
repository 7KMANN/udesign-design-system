import * as React from "react"
import axe from "axe-core"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AppShell, AppShellPane, AppShellPanes, AppShellSidebar, AppShellToolbar } from "@/components/ui/app-shell"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconButton } from "@/components/ui/icon-button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Moment } from "@/components/ui/moment"
import { PageCanvas, PageSection } from "@/components/ui/page-canvas"
import { ProgressRing } from "@/components/ui/progress-ring"
import { ResponsiveCollection } from "@/components/ui/responsive-collection"
import { RollingConsistencyChip } from "@/components/ui/rolling-consistency-chip"
import { Slider } from "@/components/ui/slider"
import { StatusBadge } from "@/components/ui/status-badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

  // D-21: tailwind-merge only drops a base padding class that conflicts with the
  // override, and sm:p-6 does not conflict with p-0. So a consumer's p-0 used to
  // give 0 on phones and 24px on desktop, silently. No breakpoint-prefixed
  // padding in the base class is what lets one p-0 win completely. (The cn()
  // here is a plain join, so this asserts the base classes, not the merge.)
  it.each([
    ["dialog", () => (
      <Dialog open>
        <DialogContent className="p-0"><DialogTitle>Edge</DialogTitle><DialogDescription>Flush.</DialogDescription></DialogContent>
      </Dialog>
    )],
    ["sheet", () => (
      <Sheet open>
        <SheetContent className="p-0"><SheetTitle>Edge</SheetTitle><SheetDescription>Flush.</SheetDescription></SheetContent>
      </Sheet>
    )],
  ])("lets a single p-0 remove all %s padding", (_, ui) => {
    render(ui())
    const padding = screen.getByRole("dialog").className.split(/\s+/).filter((c) => /^(?:[\w-]+:)*p-/.test(c))
    expect(padding.filter((c) => c.includes(":"))).toEqual([])
    // D-22's hook: the operations profile sets --surface-padding from outside,
    // so the element may only declare the fallback, never the variable itself.
    expect(screen.getByRole("dialog").className).not.toContain("[--surface-padding:")
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

  it("renders a truthful numeric readout on the progress ring, not just an arc", () => {
    render(<ProgressRing completed={3} total={5} label="3 of 5 closed" />)

    const ring = screen.getByRole("img", { name: "3 of 5 closed" })
    expect(ring).toHaveTextContent("3/5")
  })

  it("gives the progress ring a safe, non-NaN empty state at total 0", () => {
    render(<ProgressRing completed={0} total={0} label="0 of 0 closed" />)

    const ring = screen.getByRole("img", { name: "0 of 0 closed" })
    expect(ring.innerHTML).not.toContain("NaN")
  })

  it("renders the rolling consistency chip as a plain count, tone stable regardless of value", () => {
    const { rerender } = render(<RollingConsistencyChip count={0} window={7} />)
    const lowCountElement = screen.getByText("0 of the last 7")
    expect(lowCountElement).toBeVisible()
    // Captured as a plain string, not a live DOM reference - rerender()
    // mutates this same node in place, so comparing the node after rerender
    // would trivially equal itself and prove nothing.
    const lowCountClassName = lowCountElement.className

    rerender(<RollingConsistencyChip count={7} window={7} />)
    const highCountElement = screen.getByText("7 of the last 7")
    // Same tone regardless of count - a low count must not read as a
    // warning and a high count must not read as success; it is a fact, not
    // a judgment (ADR-0004 rolling consistency, never a streak).
    expect(highCountElement.className).toContain("--tone-neutral-surface")
    expect(lowCountClassName).toBe(highCountElement.className)
  })

  it("keeps the moment wrapper inline, transform-only, with no icon/text content of its own", () => {
    render(
      <Moment intensity={2} active>
        <span data-testid="moment-child">Loop closed</span>
      </Moment>,
    )

    const child = screen.getByTestId("moment-child")
    const wrapper = child.parentElement as HTMLElement
    expect(wrapper).toHaveAttribute("data-slot", "moment")
    expect(wrapper).toHaveClass("inline-block")
    // No portal: the wrapper is a plain ancestor of the child in the same tree.
    expect(wrapper.contains(child)).toBe(true)
    // Renders exactly the caller's content - no injected icon/text of its own.
    expect(wrapper).toHaveTextContent("Loop closed")
    expect(wrapper.style.transform).toBe("scale(var(--moment-intensity-2-scale, 1))")
  })

  it("does not apply the moment scale before active is true", () => {
    render(
      <Moment intensity={1} active={false}>
        <span>Stage advanced</span>
      </Moment>,
    )

    const wrapper = screen.getByText("Stage advanced").parentElement as HTMLElement
    expect(wrapper.style.transform).toBe("scale(1)")
  })

  it("marks a pending action as busy without greying it out", () => {
    render(<Button pending>Save</Button>)

    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(button).toBeDisabled()
    // A pending control keeps its own colours: disabled styling reads as
    // "broken", which is the opposite of what it is doing.
    expect(button.className).not.toContain("disabled:bg-[var(--interactive-disabled)]")
  })

  it("keeps a pending button's label in the layout so its width does not jump", () => {
    render(<Button pending>Save changes</Button>)

    // Hidden from view, still measured: this is the whole point.
    const label = screen.getByText("Save changes")
    expect(label).toHaveClass("invisible")
    expect(screen.getByRole("button")).toContainElement(label)
  })

  it("does not fire a click on a pending action", async () => {
    const onClick = vi.fn()
    render(<Button pending onClick={onClick}>Send</Button>)

    await userEvent.click(screen.getByRole("button"))
    expect(onClick).not.toHaveBeenCalled()
  })
})

// D-20: the first structural components. Operations sits in AppShell, presentation in PageCanvas.
describe("UDesign page shells", () => {
  const operationsScreen = () => (
    <AppShell>
      <AppShellSidebar><nav aria-label="Main"><a href="#queue">Production</a></nav></AppShellSidebar>
      <AppShellToolbar><h1>Production queue</h1></AppShellToolbar>
      <AppShellPanes>
        <AppShellPane aria-label="Orders"><button type="button">UD-1042</button></AppShellPane>
        <AppShellPane aria-label="Order detail"><p>108 pieces</p></AppShellPane>
      </AppShellPanes>
    </AppShell>
  )

  it("holds the viewport on desktop and scrolls the panes, not the page", () => {
    const { container } = render(operationsScreen())
    expect(container.firstElementChild).toHaveClass("md:h-svh", "md:overflow-hidden")
    for (const pane of screen.getAllByRole("region")) expect(pane).toHaveClass("md:overflow-y-auto", "md:min-h-0")
    expect(screen.getByRole("main")).toContainElement(screen.getByRole("region", { name: "Order detail" }))
  })

  it("lets the page scroll again on phones, where a fixed viewport traps content", () => {
    const { container } = render(operationsScreen())
    expect(container.firstElementChild).toHaveClass("min-h-svh")
    expect(container.firstElementChild?.className).not.toMatch(/(?:^|s)(?:h-svh|overflow-hidden)(?:s|$)/)
  })

  it("renders the operations shell without axe violations", async () => {
    const { container } = render(operationsScreen())
    expect((await axe.run(container)).violations).toEqual([])
  })

  it("centers presentation content in a column while a section bleeds to the edge", async () => {
    const { container } = render(
      <PageCanvas>
        <PageSection variant="band" aria-label="Chosen garments"><h2>Chosen garments</h2></PageSection>
      </PageCanvas>,
    )
    const section = screen.getByRole("region", { name: "Chosen garments" })
    expect(section.firstElementChild).toHaveClass("mx-auto", "max-w-6xl")
    expect(section).toHaveClass("bg-[var(--card)]")
    expect((await axe.run(container)).violations).toEqual([])
  })

  it("marks a numeric table column so each profile can render its figures", () => {
    render(
      <Table>
        <TableHeader><TableRow><TableHead numeric>Qty</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><TableCell numeric>108</TableCell></TableRow></TableBody>
      </Table>,
    )
    expect(screen.getByText("108")).toHaveClass("text-right", "[font-family:var(--font-numeric)]")
    expect(screen.getByText("Qty")).toHaveClass("text-right")
  })
})
