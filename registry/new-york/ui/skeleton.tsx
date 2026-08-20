import * as React from "react"

import { cn } from "@/lib/utils"

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

/**
 * A placeholder that mirrors the dimensions of the content it stands in for.
 * A fallback of a different height causes a jump on arrival, which reads worse
 * than the blank pause it replaced - size this to the real thing.
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    className={cn("rounded-md bg-[var(--muted)] motion-safe:animate-pulse [animation-duration:var(--motion-duration-ambient)]", className)}
    {...props}
  />
))
Skeleton.displayName = "Skeleton"

export { Skeleton }
