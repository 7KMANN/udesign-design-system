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

export interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** At most one action, at right: the way back, or "Not you?". A ghost or link Button. */
  action?: React.ReactNode
}

// A presentation page's header (D-52): the lockup (children) at left, at most one action at
// right, in one row at least a touch target high, so the row keeps its height whoever is on the
// page, with or without the action. It sits on PageSection's column and gutters.
const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(({ action, children, className, ...props }, ref) => (
  <header ref={ref} className={cn("py-[clamp(var(--space-4),4vw,var(--space-6))]", className)} {...props}>
    <div className="mx-auto flex min-h-[var(--touch-target-min)] w-full max-w-6xl items-center justify-between gap-4 px-[var(--content-gutter-mobile)] sm:px-[var(--space-8)]">
      <div className="flex min-w-0 items-center">{children}</div>
      {/* The action never wraps: the row stays one row. */}
      {action ? <div className="flex shrink-0 items-center whitespace-nowrap">{action}</div> : null}
    </div>
  </header>
))
PageHeader.displayName = "PageHeader"

export interface ContactLink {
  /** As shown, such as the number or the address. */
  label: string
  /** A tel: or mailto: link. */
  href: string
}

export interface ContactFooterProps extends React.HTMLAttributes<HTMLElement> {
  /** Who and where, in one line: the business's name and public address. The page supplies it; the design system holds no business data. */
  address: React.ReactNode
  phone?: ContactLink
  email?: ContactLink
}

// The end of a presentation page (D-53): the business's public contact over a hairline, on the
// sections' column. The phone and the email are links a thumb can reach, with a press and a ring.
const ContactFooter = React.forwardRef<HTMLElement, ContactFooterProps>(({ address, className, email, phone, ...props }, ref) => {
  const links = [phone, email].filter((link): link is ContactLink => Boolean(link))
  return (
    <footer ref={ref} className={cn("border-t border-[var(--border)] py-[clamp(var(--space-4),4vw,var(--space-6))]", className)} {...props}>
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 px-[var(--content-gutter-mobile)] sm:px-[var(--space-8)]">
        <p className="ud-label">{address}</p>
        {links.length ? (
          <p className="ud-label flex flex-wrap items-center gap-x-2">
            {links.map((link, i) => (
              <React.Fragment key={link.href}>
                {i > 0 ? <span aria-hidden="true">·</span> : null}
                <a
                  href={link.href}
                  className="inline-flex min-h-[var(--touch-target-min)] items-center rounded-[var(--radius-sm)] underline-offset-4 transition-[background-color] duration-[var(--motion-duration-instant)] ease-[var(--motion-easing-standard)] hover:underline active:bg-[var(--interactive-pressed)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--interactive-focus)]"
                >
                  {link.label}
                </a>
              </React.Fragment>
            ))}
          </p>
        ) : null}
      </div>
    </footer>
  )
})
ContactFooter.displayName = "ContactFooter"

export { ContactFooter, PageCanvas, PageHeader, PageSection }
