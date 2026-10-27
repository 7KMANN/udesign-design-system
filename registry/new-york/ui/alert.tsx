import * as React from "react"

import { cn } from "@/lib/utils"
import type { UDesignTone } from "@/components/ui/badge"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: UDesignTone
  /**
   * Reads the alert to a screen reader when it appears or changes. true or "polite"
   * (role="status") waits for the reader to finish; "assertive" (role="alert")
   * interrupts, for an error that stops the work. Omit it for a notice shown with the
   * page, which a screen reader meets in reading order. A role passed explicitly wins.
   */
  live?: boolean | "polite" | "assertive"
}

const liveRoles = { polite: "status", assertive: "alert" } as const

const alertTones: Record<UDesignTone, string> = {
  neutral: "border-[var(--tone-neutral-border)] bg-[var(--tone-neutral-surface)] text-[var(--tone-neutral-foreground)]",
  info: "border-[var(--tone-info-border)] bg-[var(--tone-info-surface)] text-[var(--tone-info-foreground)]",
  success: "border-[var(--tone-success-border)] bg-[var(--tone-success-surface)] text-[var(--tone-success-foreground)]",
  warning: "border-[var(--tone-warning-border)] bg-[var(--tone-warning-surface)] text-[var(--tone-warning-foreground)]",
  danger: "border-[var(--tone-danger-border)] bg-[var(--tone-danger-surface)] text-[var(--tone-danger-foreground)]",
  progress: "border-[var(--tone-progress-border)] bg-[var(--tone-progress-surface)] text-[var(--tone-progress-foreground)]",
  brand: "border-[var(--tone-brand-border)] bg-[var(--tone-brand-surface)] text-[var(--tone-brand-foreground)]",
}

// Not a live region by default: most alerts are shown with the page, not news.
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, live = false, role, tone = "neutral", ...props }, ref) => (
    <div
      ref={ref}
      data-slot="alert"
      role={role ?? (live ? liveRoles[live === true ? "polite" : live] : undefined)}
      className={cn("relative w-full rounded-[var(--radius-lg)] border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7", alertTones[tone], className)}
      {...props}
    />
  ),
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn("mb-1 font-semibold leading-none", className)} {...props} />,
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("text-sm leading-relaxed", className)} {...props} />,
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription, AlertTitle }
