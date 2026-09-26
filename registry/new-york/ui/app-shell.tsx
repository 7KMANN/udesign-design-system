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
        "grid min-h-svh bg-[var(--background)] text-[var(--foreground)] [font-variant-numeric:var(--font-numeric-variant)] md:h-svh md:grid-cols-[14rem_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)] md:overflow-hidden",
        className,
      )}
      {...props}
    />
  ),
)
AppShell.displayName = "AppShell"

// Put a <nav> inside. Lay it out `flex md:flex-col`: on phones the sidebar is a
// row above the toolbar that scrolls sideways.
const AppShellSidebar = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn(
        "overflow-x-auto border-b border-[var(--sidebar-border)] bg-[var(--sidebar)] text-[var(--sidebar-foreground)] md:row-span-2 md:overflow-y-auto md:overflow-x-hidden md:border-b-0 md:border-r",
        className,
      )}
      {...props}
    />
  ),
)
AppShellSidebar.displayName = "AppShellSidebar"

const AppShellToolbar = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      className={cn("flex min-h-[var(--control-height)] items-center gap-2 border-b border-[var(--border)] bg-[var(--card)] px-4", className)}
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
      className={cn("grid md:min-h-0 md:grid-flow-col md:auto-cols-[minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)]", className)}
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
