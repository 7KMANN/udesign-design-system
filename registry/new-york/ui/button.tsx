import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  /**
   * The action is in flight. Disables the control, reports aria-busy, and
   * swaps in a spinner while preserving the button's width, so the layout
   * does not jump when the work starts.
   *
   * Ignored for asChild, where the single child owns its own content.
   */
  pending?: boolean
  size?: "compact" | "default" | "icon"
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link"
}

// Press treatment is per-variant on purpose: a neutral surface darkens to the
// pressed role, a solid surface has no deeper solid role to move to. Every
// variant keeps a non-motion signal, because --motion-press-scale collapses to
// 1 under prefers-reduced-motion and colour does not.
const buttonVariants = {
  default: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-hover)] active:opacity-90",
  secondary: "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--interactive-hover)] active:bg-[var(--interactive-pressed)]",
  outline: "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--interactive-hover)] active:bg-[var(--interactive-pressed)]",
  ghost: "text-[var(--foreground)] hover:bg-[var(--interactive-hover)] active:bg-[var(--interactive-pressed)]",
  destructive: "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90 active:opacity-80",
  link: "h-auto min-h-[var(--touch-target-min)] px-1 text-[var(--foreground)] underline-offset-4 hover:underline active:opacity-80",
} as const

const buttonSizes = {
  compact: "h-[var(--control-height-compact)] max-md:min-h-[var(--touch-target-min)] [@media(pointer:coarse)]:min-h-[var(--touch-target-min)] px-3 text-sm",
  default: "h-[var(--control-height)] min-h-[var(--touch-target-min)] px-4 py-2",
  icon: "size-[var(--touch-target-min)] p-0",
} as const

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, children, className, disabled, pending = false, size = "default", variant = "default", ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const busy = pending && !asChild
    return (
      <Comp
        ref={ref}
        aria-busy={pending || undefined}
        disabled={asChild ? undefined : disabled || pending}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] font-medium transition-[transform,background-color,color,opacity] duration-[var(--motion-duration-instant)] ease-[var(--motion-easing-standard)] active:scale-[var(--motion-press-scale)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--interactive-focus)] disabled:pointer-events-none",
          // A pending button keeps its own colours. Greying it out reads as
          // "broken", which is the opposite of what it is doing.
          busy ? "active:scale-100" : "disabled:bg-[var(--interactive-disabled)] disabled:text-[var(--interactive-disabled-foreground)]",
          buttonVariants[variant],
          buttonSizes[size],
          className,
        )}
        {...props}
      >
        {busy ? (
          <>
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Spinner />
            </span>
            {/* Kept in the layout, hidden from view: this is what preserves the width. */}
            <span className="invisible inline-flex items-center gap-2">{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonSizes, buttonVariants }
