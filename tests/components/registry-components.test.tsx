import * as React from "react"
import axe from "axe-core"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Alert } from "@/components/ui/alert"
import { AppShell, AppShellPane, AppShellPanes, AppShellSidebar, AppShellToolbar } from "@/components/ui/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconButton } from "@/components/ui/icon-button"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Moment } from "@/components/ui/moment"
import { ContactFooter, PageCanvas, PageHeader, PageSection } from "@/components/ui/page-canvas"
import { ProgressRing } from "@/components/ui/progress-ring"
import { ResponsiveCollection } from "@/components/ui/responsive-collection"
import { RollingConsistencyChip } from "@/components/ui/rolling-consistency-chip"
import { Slider } from "@/components/ui/slider"
import { StatusBadge } from "@/components/ui/status-badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { applyTailwind } from "./tailwind"

describe("UDesign registry accessibility contracts", () => {
  it("lets a card title take the heading level its page outline needs, h3 by default", () => {
    render(
      <>
        <Card><CardHeader><CardTitle>Default</CardTitle></CardHeader></Card>
        <Card><CardHeader><CardTitle as="h2">Section</CardTitle></CardHeader></Card>
      </>,
    )

    expect(screen.getByRole("heading", { name: "Default" }).tagName).toBe("H3")
    expect(screen.getByRole("heading", { name: "Section" }).tagName).toBe("H2")
  })

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

  // closeDisabled and hideClose touch the button only. Escape and a press outside stay
  // wired to onOpenChange, where the caller decides whether a running action may close.
  describe.each([
    ["dialog", Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription],
    ["sheet", Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription],
  ] as const)("%s close button", (_, Root, Content, Header, Title, Description) => {
    it("can be disabled while an action runs, and Escape still reaches onOpenChange", async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(
        <Root open onOpenChange={onOpenChange}>
          <Content closeDisabled closeLabel="Fermer"><Title>Envoi</Title><Description>La commande part.</Description></Content>
        </Root>,
      )
      const close = screen.getByRole("button", { name: "Fermer" })
      expect(close).toBeDisabled()
      expect(close).toHaveClass("disabled:bg-[var(--interactive-disabled)]", "disabled:text-[var(--interactive-disabled-foreground)]")
      await user.click(close)
      expect(onOpenChange).not.toHaveBeenCalled()
      await user.keyboard("{Escape}")
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it("can be hidden, and Escape still reaches onOpenChange", async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(
        <Root open onOpenChange={onOpenChange}>
          <Content hideClose closeLabel="Fermer"><Title>Envoi</Title><Description>La commande part.</Description></Content>
        </Root>,
      )
      expect(screen.queryByRole("button", { name: "Fermer" })).toBeNull()
      await user.keyboard("{Escape}")
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    // The room is the title row's alone, so a block in the description reaches the
    // footer's edge (measured in Chromium by tests/e2e/showcase.spec.ts).
    it("takes its room from the title row only, and none once hidden", () => {
      const room = ["pr-10", "min-h-[calc(2.125rem_-_var(--surface-padding,var(--surface-padding-default)))]"]
      const { rerender } = render(
        <Root open>
          <Content closeLabel="Fermer"><Header><Title>Envoi</Title><Description>La commande part.</Description></Header></Content>
        </Root>,
      )
      expect(screen.getByRole("heading", { name: "Envoi" })).toHaveClass(...room)
      expect(screen.getByRole("heading", { name: "Envoi" }).parentElement).not.toHaveClass("pr-10")
      expect(screen.getByText("La commande part.")).not.toHaveClass("pr-10")
      rerender(
        <Root open>
          <Content hideClose closeLabel="Fermer"><Header><Title>Envoi</Title><Description>La commande part.</Description></Header></Content>
        </Root>,
      )
      for (const cls of room) expect(screen.getByRole("heading", { name: "Envoi" })).not.toHaveClass(cls)
    })

    it("is enabled and present by default", () => {
      render(
        <Root open>
          <Content closeLabel="Fermer"><Title>Envoi</Title><Description>La commande part.</Description></Content>
        </Root>,
      )
      expect(screen.getByRole("button", { name: "Fermer" })).toBeEnabled()
    })
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

    // Transparent, still measured: this is what keeps the width.
    const label = screen.getByText("Save changes")
    expect(label).toHaveClass("opacity-0")
    expect(screen.getByRole("button")).toContainElement(label)
  })

  it("keeps a pending button's accessible name while it waits", async () => {
    const { container } = render(
      <>
        <Button pending>Save changes</Button>
        <Button pending size="icon" aria-label="Refresh"><span aria-hidden="true">R</span></Button>
      </>,
    )
    // With the real utilities applied, a label hidden with visibility drops out of the name.
    const removeStyles = await applyTailwind(container)
    try {
      const button = screen.getByRole("button", { name: "Save changes" })
      expect(button).toHaveAccessibleName("Save changes")
      expect(button).toHaveAttribute("aria-busy", "true")
      expect(screen.getByRole("button", { name: "Refresh" })).toHaveAttribute("aria-busy", "true")
    } finally {
      removeStyles()
    }
  })

  // D-47: one line by default, so a status in a table column stays whole; asked, a long label
  // wraps inside its container instead of running past a narrow card's edge (ban 29).
  it("holds a badge on one line unless asked to wrap inside its container", async () => {
    const { container } = render(
      <>
        <Badge tone="info">En production</Badge>
        <Badge tone="info" wrap>Brodé au nom de chaque joueur</Badge>
      </>,
    )
    const removeStyles = await applyTailwind(container)
    try {
      const line = getComputedStyle(screen.getByText("En production"))
      expect(line.whiteSpace).toBe("nowrap")
      const wrapped = getComputedStyle(screen.getByText("Brodé au nom de chaque joueur"))
      expect(wrapped.whiteSpace).toBe("normal")
      expect(wrapped.maxWidth).toBe("100%")
      expect(wrapped.overflowWrap).toBe("anywhere")
    } finally {
      removeStyles()
    }
  })

  // D-55: an alert shown with the page is part of the page. Only one whose appearance is the
  // news is a live region, so a banner never needs role="presentation" to stay quiet.
  it("makes an alert a live region only when asked, and lets an explicit role win", () => {
    render(
      <>
        <Alert tone="neutral">La boutique est fermée.</Alert>
        <Alert tone="success" live>Commande envoyée.</Alert>
        <Alert tone="danger" live="assertive">Le lien est perdu.</Alert>
        <Alert tone="info" live="polite" role="note">Note de produit.</Alert>
      </>,
    )
    expect(screen.getByText("La boutique est fermée.")).not.toHaveAttribute("role")
    expect(screen.getByText("La boutique est fermée.")).toHaveAttribute("data-slot", "alert")
    expect(screen.getAllByRole("status")).toHaveLength(1)
    expect(screen.getByRole("status")).toHaveTextContent("Commande envoyée.")
    expect(screen.getByRole("alert")).toHaveTextContent("Le lien est perdu.")
    expect(screen.getByRole("note")).toHaveTextContent("Note de produit.")
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

  // Below md the rows were implicit and auto, so a page shorter than the screen
  // stretched the toolbar. The rows are explicit at every width now.
  it("keeps the toolbar's own height and gives the panes the rest, at every width", () => {
    const { container } = render(operationsScreen())
    const shell = container.firstElementChild as HTMLElement
    expect(shell).toHaveClass("grid-rows-[auto_minmax(0,1fr)]")
    expect([...shell.classList].filter((c) => c.includes("grid-rows-"))).toEqual(["grid-rows-[auto_minmax(0,1fr)]"])
  })

  it("lets the page scroll again on phones, where a fixed viewport traps content", () => {
    const { container } = render(operationsScreen())
    expect(container.firstElementChild).toHaveClass("min-h-svh")
    expect(container.firstElementChild).not.toHaveClass("h-svh")
    expect(container.firstElementChild).not.toHaveClass("overflow-hidden")
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

  // D-52: the lockup at left, at most one action at right, one row a touch target high on the
  // sections' column, whoever is on the page (measured in Chromium by the layout audit).
  it("opens a presentation page with the lockup at left and at most one action at right, in one row", async () => {
    const page = (action?: React.ReactNode) => (
      <PageCanvas>
        <PageHeader action={action}><span>UDesign</span></PageHeader>
      </PageCanvas>
    )
    const { container, rerender } = render(page(<button type="button">Ce n’est pas vous ?</button>))
    const row = screen.getByRole("banner").firstElementChild as HTMLElement
    expect(row).toHaveClass("min-h-[var(--touch-target-min)]", "mx-auto", "max-w-6xl", "items-center", "justify-between")
    expect(row.children).toHaveLength(2)
    expect(screen.getByRole("button", { name: "Ce n’est pas vous ?" }).parentElement).toHaveClass("shrink-0", "whitespace-nowrap")
    expect((await axe.run(container)).violations).toEqual([])
    rerender(page())
    expect(screen.getByRole("banner").firstElementChild?.children).toHaveLength(1)
  })

  // D-53: the page supplies the contact; the footer holds none of its own.
  it("ends a presentation page with the public contact the page supplies, as links a thumb can reach", async () => {
    const { container, rerender } = render(
      <ContactFooter
        address="Entreprise exemple, 1 rue Exemple, Ville QC"
        phone={{ label: "819 555-0100", href: "tel:+18195550100" }}
        email={{ label: "contact@example.com", href: "mailto:contact@example.com" }}
      />,
    )
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Entreprise exemple, 1 rue Exemple, Ville QC")
    const phone = screen.getByRole("link", { name: "819 555-0100" })
    expect(phone).toHaveAttribute("href", "tel:+18195550100")
    expect(screen.getByRole("link", { name: "contact@example.com" })).toHaveAttribute("href", "mailto:contact@example.com")
    expect(phone).toHaveClass("min-h-[var(--touch-target-min)]", "active:bg-[var(--interactive-pressed)]", "focus-visible:outline-[color:var(--interactive-focus)]")
    expect((await axe.run(container)).violations).toEqual([])
    rerender(<ContactFooter address="Entreprise exemple" />)
    expect(screen.queryAllByRole("link")).toEqual([])
    expect(screen.getByRole("contentinfo").textContent).toBe("Entreprise exemple")
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

// Ban 9 allows a native control inside components/ui. NativeSelect is the platform's select
// dressed as SelectTrigger, for long lists, dense grids of selects, and phones.
describe("NativeSelect", () => {
  const options = (
    <>
      <option value="">Choisir une étape</option>
      <option value="waiting">En attente</option>
      <option value="production">En production</option>
    </>
  )

  it("is the platform's select: labelled, form-ready, with the ref on the select", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const ref = React.createRef<HTMLSelectElement>()
    render(<label>Étape <NativeSelect ref={ref} name="step" defaultValue="" onChange={onChange}>{options}</NativeSelect></label>)
    const select = screen.getByRole("combobox", { name: "Étape" })
    expect(select.tagName).toBe("SELECT")
    expect(ref.current).toBe(select)
    await user.selectOptions(select, "production")
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(select).toHaveValue("production")
  })

  it("puts className on the wrapper that holds the chevron, so a width sizes both", () => {
    render(<NativeSelect aria-label="Étape" className="sm:w-48">{options}</NativeSelect>)
    const select = screen.getByRole("combobox", { name: "Étape" })
    const wrapper = select.parentElement as HTMLElement
    expect(wrapper).toHaveAttribute("data-slot", "native-select")
    expect(wrapper).toHaveClass("relative", "w-full", "sm:w-48")
    expect(select).not.toHaveClass("sm:w-48")
    expect(wrapper.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })

  // One control family: if SelectTrigger gains a state, this fails until NativeSelect has it too.
  it("shares SelectTrigger's tokens, height, radius, focus, hover, pressed, disabled and invalid states", () => {
    render(
      <>
        <Select><SelectTrigger aria-label="Radix"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="a">A</SelectItem></SelectContent></Select>
        <NativeSelect aria-label="Native">{options}</NativeSelect>
      </>,
    )
    const shared = [...screen.getByRole("combobox", { name: "Radix" }).classList].filter((c) =>
      /^(?:h-|min-h-|rounded-|border|bg-|text-\[|duration-|ease-|hover:|active:bg-|focus-visible:|disabled:|aria-)/.test(c),
    )
    expect(shared.length).toBeGreaterThanOrEqual(15)
    const native = screen.getByRole("combobox", { name: "Native" })
    expect([...native.classList]).toEqual(expect.arrayContaining(shared))
    // The press scale sits on the wrapper, so the chevron moves with the field.
    expect(native.parentElement).toHaveClass("has-[select:active]:scale-[var(--motion-press-scale)]")
  })

  it("marks an invalid field with the same boundary as every other field", () => {
    render(
      <>
        <Input aria-label="Nom" aria-invalid="true" />
        <Textarea aria-label="Notes" aria-invalid="true" />
        <Select><SelectTrigger aria-label="Méthode" aria-invalid="true"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="a">A</SelectItem></SelectContent></Select>
        <NativeSelect aria-label="Étape" aria-invalid="true">{options}</NativeSelect>
      </>,
    )
    for (const field of [
      screen.getByRole("textbox", { name: "Nom" }),
      screen.getByRole("textbox", { name: "Notes" }),
      screen.getByRole("combobox", { name: "Méthode" }),
      screen.getByRole("combobox", { name: "Étape" }),
    ]) {
      expect(field).toHaveClass("aria-[invalid=true]:border-[var(--tone-danger-foreground)]")
      expect(field).toHaveAttribute("aria-invalid", "true")
    }
  })

  it("renders without axe violations, disabled included", async () => {
    const { container } = render(
      <main>
        <label>Étape <NativeSelect defaultValue="waiting">{options}</NativeSelect></label>
        <label>Poste <NativeSelect disabled defaultValue="">{options}</NativeSelect></label>
      </main>,
    )
    expect(screen.getByRole("combobox", { name: "Poste" })).toBeDisabled()
    expect((await axe.run(container)).violations).toEqual([])
  })
})
