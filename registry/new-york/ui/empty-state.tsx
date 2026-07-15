import * as React from "react"

import { cn } from "@/lib/utils"

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  action?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  title: React.ReactNode
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ action, className, description, icon, title, ...props }, ref) => (
    <div ref={ref} className={cn("flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-sunken)] p-6 text-center text-[var(--surface-sunken-foreground)]", className)} {...props}>
      {icon ? <div className="mb-3 flex size-[var(--touch-target-min)] items-center justify-center rounded-full bg-[var(--tone-neutral-surface)] text-[var(--tone-neutral-foreground)]">{icon}</div> : null}
      <h3 className="[font-family:var(--font-display)] text-base font-semibold">{title}</h3>
      {description ? <div className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">{description}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  ),
)
EmptyState.displayName = "EmptyState"

export { EmptyState }
