import * as React from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type MetricTone = "positive" | "negative" | "neutral"

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  detail?: React.ReactNode
  label: React.ReactNode
  tone?: MetricTone
  value: React.ReactNode
}

const metricTones: Record<MetricTone, string> = {
  positive: "border-[var(--metric-positive-border)] bg-[var(--metric-positive-surface)] text-[var(--metric-positive-foreground)]",
  negative: "border-[var(--metric-negative-border)] bg-[var(--metric-negative-surface)] text-[var(--metric-negative-foreground)]",
  neutral: "border-[var(--metric-neutral-border)] bg-[var(--metric-neutral-surface)] text-[var(--metric-neutral-foreground)]",
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, detail, label, tone = "neutral", value, ...props }, ref) => (
    <Card ref={ref} className={cn(metricTones[tone], className)} {...props}>
      <CardHeader className="pb-2"><p className="text-sm font-medium">{label}</p></CardHeader>
      <CardContent>
        <p className="[font-family:var(--font-data)] text-2xl font-semibold tabular-nums">{value}</p>
        {detail ? <div className="mt-1 text-sm">{detail}</div> : null}
      </CardContent>
    </Card>
  ),
)
MetricCard.displayName = "MetricCard"

export { MetricCard }
