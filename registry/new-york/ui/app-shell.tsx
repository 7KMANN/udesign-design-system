import * as React from "react"

import { cn } from "@/lib/utils"

// The operations archetype (D-19, D-20). A fixed viewport with a persistent
// sidebar: panes scroll, the page does not. Hierarchy comes from structure, so
// panes butt against each other on hairlines with no gap and no elevation.
// Figures align in columns wherever the profile makes them tabular.
// Below md the viewport is released and the page scrolls, because a fixed
// viewport on a phone traps content behind the keyboard and the browser chrome.

const AppShell = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid min-h-svh max-md:grid-cols-[minmax(0,1fr)] bg-[var(--background)] text-[var(--foreground)] [font-variant-numeric:var(--font-numeric-variant)] md:h-svh md:grid-cols-[14rem_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)] md:overflow-hidden",
        className,
      )}
      {...props}
    />
  ),
)
AppShell.displayName = "AppShell"

// Put a <nav> inside, laid out as a column. From md only: on phones the same
// nav opens in a Sheet (side="left") from a menu Button in the toolbar, one nav
// component rendered in both places so they never drift (udesign-docs
// standards/design/mobile-accessibility.md). examples/operations-queue.tsx shows it.
const AppShellSidebar = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn(
        "max-md:hidden border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-[var(--sidebar-foreground)] md:row-span-2 md:overflow-y-auto md:overflow-x-hidden",
        className,
      )}
      {...props}
    />
  ),
)
AppShellSidebar.displayName = "AppShellSidebar"

// On a desktop mouse the toolbar's controls go compact (36px), the way Button
// size="compact" does, so a field does not fill the 44px bar edge to edge. The
// tokens are set on the children, not the bar, which keeps its own 44px height.
// Touch keeps the 44px floor (ban 20).
const AppShellToolbar = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      className={cn("flex min-h-[var(--control-height)] items-center gap-2 md:[@media(pointer:fine)]:[&>*]:[--control-height:var(--control-height-compact)] md:[@media(pointer:fine)]:[&>*]:[--touch-target-min:var(--control-height-compact)] border-b border-[var(--border)] bg-[var(--card)] px-4", className)}
      {...props}
    />
  ),
)
AppShellToolbar.displayName = "AppShellToolbar"

// Panes sit side by side from md, equal width by default. Pass a column
// template to size them, for example `md:grid-cols-[minmax(0,1fr)_24rem]`.
const AppShellPanes = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <main
      ref={ref}
      className={cn("grid max-md:grid-cols-[minmax(0,1fr)] md:min-h-0 md:grid-flow-col md:auto-cols-[minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)]", className)}
      {...props}
    />
  ),
)
AppShellPanes.displayName = "AppShellPanes"

// Give each pane an aria-label so it is a named region a screen reader can jump to.
const AppShellPane = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <section
      ref={ref}
      className={cn(
        "min-w-0 border-t border-[var(--border)] first:border-t-0 md:min-h-0 md:overflow-y-auto md:border-l md:border-t-0 md:first:border-l-0",
        className,
      )}
      {...props}
    />
  ),
)
AppShellPane.displayName = "AppShellPane"

export { AppShell, AppShellPane, AppShellPanes, AppShellSidebar, AppShellToolbar }
