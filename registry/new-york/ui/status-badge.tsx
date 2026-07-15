import * as React from "react"

import { Badge, type BadgeProps, type UDesignTone } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface StatusBadgeProps extends Omit<BadgeProps, "tone"> {
  busy?: boolean
  icon?: React.ReactNode
  tone: UDesignTone
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ busy = false, children, className, icon, tone, ...props }, ref) => (
    <Badge ref={ref} aria-busy={busy || undefined} className={cn("gap-1.5", className)} tone={tone} {...props}>
      {busy ? <span aria-hidden="true" className="size-3 animate-spin rounded-full border border-current border-r-transparent motion-reduce:animate-none" /> : icon}
      {children}
    </Badge>
  ),
)
StatusBadge.displayName = "StatusBadge"

export { StatusBadge }
