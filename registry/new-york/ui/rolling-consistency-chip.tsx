import * as React from "react"

import { Badge, type BadgeProps } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface RollingConsistencyChipProps extends Omit<BadgeProps, "tone" | "children"> {
  /** How many days within the window satisfied the condition being counted. */
  count: number
  /** Size of the trailing-day window the count is measured against. */
  window: number
  /** Overrides the computed "{count} of the last {window}" text. */
  label?: string
}

const RollingConsistencyChip = React.forwardRef<HTMLSpanElement, RollingConsistencyChipProps>(
  ({ className, count, label, window, ...props }, ref) => (
    <Badge ref={ref} className={cn(className)} tone="neutral" {...props}>
      {label ?? `${count} of the last ${window}`}
    </Badge>
  ),
)
RollingConsistencyChip.displayName = "RollingConsistencyChip"

export { RollingConsistencyChip }
