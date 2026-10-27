import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Draws the placeholder on its one child instead of a div (D-58), such as a span where only
   * phrasing content may go, inside a button, a link or a line of text:
   * <Skeleton asChild><span className="inline-block h-4 w-16" /></Skeleton>.
   */
  asChild?: boolean
}

/**
 * A placeholder that mirrors the dimensions of the content it stands in for.
 * A fallback of a different height causes a jump on arrival, which reads worse
 * than the blank pause it replaced - size this to the real thing.
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(({ asChild = false, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      ref={ref}
      aria-hidden="true"
      className={cn("rounded-[var(--radius)] bg-[var(--muted)] motion-safe:animate-pulse [animation-duration:var(--motion-duration-ambient)]", className)}
      {...props}
    />
  )
})
Skeleton.displayName = "Skeleton"

export { Skeleton }
