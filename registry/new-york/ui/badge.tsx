import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

export type UDesignTone = "neutral" | "info" | "success" | "warning" | "danger" | "progress" | "brand"
export type BadgeVariant = "subtle" | "solid" | "outline"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean
  tone?: UDesignTone
  variant?: BadgeVariant
}

const toneClasses: Record<UDesignTone, Record<BadgeVariant, string>> = {
  neutral: {
    subtle: "border-[var(--tone-neutral-border)] bg-[var(--tone-neutral-surface)] text-[var(--tone-neutral-foreground)]",
    solid: "border-transparent bg-[var(--tone-neutral-solid)] text-[var(--tone-neutral-solid-foreground)]",
    outline: "border-[var(--tone-neutral-border)] bg-transparent text-[var(--tone-neutral-foreground)]",
  },
  info: {
    subtle: "border-[var(--tone-info-border)] bg-[var(--tone-info-surface)] text-[var(--tone-info-foreground)]",
    solid: "border-transparent bg-[var(--tone-info-solid)] text-[var(--tone-info-solid-foreground)]",
    outline: "border-[var(--tone-info-border)] bg-transparent text-[var(--tone-info-foreground)]",
  },
  success: {
    subtle: "border-[var(--tone-success-border)] bg-[var(--tone-success-surface)] text-[var(--tone-success-foreground)]",
    solid: "border-transparent bg-[var(--tone-success-solid)] text-[var(--tone-success-solid-foreground)]",
    outline: "border-[var(--tone-success-border)] bg-transparent text-[var(--tone-success-foreground)]",
  },
  warning: {
    subtle: "border-[var(--tone-warning-border)] bg-[var(--tone-warning-surface)] text-[var(--tone-warning-foreground)]",
    solid: "border-transparent bg-[var(--tone-warning-solid)] text-[var(--tone-warning-solid-foreground)]",
    outline: "border-[var(--tone-warning-border)] bg-transparent text-[var(--tone-warning-foreground)]",
  },
  danger: {
    subtle: "border-[var(--tone-danger-border)] bg-[var(--tone-danger-surface)] text-[var(--tone-danger-foreground)]",
    solid: "border-transparent bg-[var(--tone-danger-solid)] text-[var(--tone-danger-solid-foreground)]",
    outline: "border-[var(--tone-danger-border)] bg-transparent text-[var(--tone-danger-foreground)]",
  },
  progress: {
    subtle: "border-[var(--tone-progress-border)] bg-[var(--tone-progress-surface)] text-[var(--tone-progress-foreground)]",
    solid: "border-transparent bg-[var(--tone-progress-solid)] text-[var(--tone-progress-solid-foreground)]",
    outline: "border-[var(--tone-progress-border)] bg-transparent text-[var(--tone-progress-foreground)]",
  },
  brand: {
    subtle: "border-[var(--tone-brand-border)] bg-[var(--tone-brand-surface)] text-[var(--tone-brand-foreground)]",
    solid: "border-transparent bg-[var(--tone-brand-solid)] text-[var(--tone-brand-solid-foreground)]",
    outline: "border-[var(--tone-brand-border)] bg-transparent text-[var(--tone-brand-foreground)]",
  },
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ asChild = false, className, tone = "neutral", variant = "subtle", ...props }, ref) => {
    const Comp = asChild ? Slot : "span"
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex min-h-6 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-none",
          toneClasses[tone][variant],
          className,
        )}
        {...props}
      />
    )
  },
)
Badge.displayName = "Badge"

export { Badge, toneClasses }
