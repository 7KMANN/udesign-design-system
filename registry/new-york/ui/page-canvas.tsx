import * as React from "react"

import { cn } from "@/lib/utils"

// The presentation archetype (D-19, D-20). The page scrolls, content sits in a
// centered column, and a section may bleed to the edge. Hierarchy comes from
// space and elevation, so sections are separated generously and cards float.

const PageCanvas = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("min-h-svh bg-[var(--background)] text-[var(--foreground)]", className)} {...props} />
  ),
)
PageCanvas.displayName = "PageCanvas"

export interface PageSectionProps extends React.HTMLAttributes<HTMLElement> {
  /** `band` runs a raised surface edge to edge; `canvas` sits on the page field. */
  variant?: "canvas" | "band"
}

// One fluid padding class rather than a breakpoint pair, so a consumer's py-0 wins outright (D-21).
const PageSection = React.forwardRef<HTMLElement, PageSectionProps>(
  ({ children, className, variant = "canvas", ...props }, ref) => (
    <section
      ref={ref}
      className={cn(
        "py-[clamp(var(--space-8),8vw,calc(var(--space-8)*2))]",
        variant === "band" && "border-y border-[var(--border)] bg-[var(--card)]",
        className,
      )}
      {...props}
    >
      <div className="mx-auto w-full max-w-6xl px-[var(--content-gutter-mobile)] sm:px-[var(--space-8)]">{children}</div>
    </section>
  ),
)
PageSection.displayName = "PageSection"

export { PageCanvas, PageSection }
