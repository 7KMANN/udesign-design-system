import * as React from "react"

import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "default"
  /** Announce the wait to assistive technology. Omit when a parent already reports aria-busy. */
  label?: string
}

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(({ className, label, size = "default", ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden={label ? undefined : true}
    aria-label={label}
    role={label ? "status" : undefined}
    className={cn(
      // The ring renders whether or not it turns: under reduced motion the
      // animation is dropped and the shape is still a visible busy indicator.
      "inline-block shrink-0 rounded-full border-2 border-current border-r-transparent align-[-0.125em] motion-safe:animate-spin [animation-duration:var(--motion-loop-spin)]",
      size === "sm" ? "size-3" : "size-4",
      className,
    )}
    {...props}
  />
))
Spinner.displayName = "Spinner"

export { Spinner }
