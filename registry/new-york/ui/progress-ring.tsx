import * as React from "react"

import { cn } from "@/lib/utils"

export interface ProgressRingProps extends React.SVGAttributes<SVGSVGElement> {
  /** Number of units completed within the bounded set (e.g. 3 of 5). */
  completed: number
  /** Total size of the bounded set. */
  total: number
  /** Required accessible name, e.g. "3 of 5 closed". Carries the truthful summary a screen reader announces. */
  label: string
  /** Diameter in pixels. Defaults to 40. */
  size?: number
}

/**
 * Generic, domain-flavorless indicator for "truthful completion of a bounded
 * set" (e.g. 3 of 5 done this week). Renders an SVG ring plus a real numeric
 * readout so meaning never depends on color or arc angle alone.
 */
const ProgressRing = React.forwardRef<SVGSVGElement, ProgressRingProps>(
  ({ className, completed, total, label, size = 40, ...props }, ref) => {
    const strokeWidth = Math.max(2, size / 10)
    const center = size / 2
    const radius = center - strokeWidth / 2
    const circumference = 2 * Math.PI * radius
    const ratio = total > 0 ? Math.min(1, Math.max(0, completed / total)) : 0
    const dashoffset = circumference * (1 - ratio)
    const fontSize = Math.max(8, size * 0.26)

    return (
      <svg
        ref={ref}
        role="img"
        aria-label={label}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn("shrink-0", className)}
        {...props}
      >
        <circle
          aria-hidden="true"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-[var(--surface-sunken)]"
        />
        <circle
          aria-hidden="true"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          transform={`rotate(-90 ${center} ${center})`}
          className="stroke-[var(--tone-progress-solid)] transition-[stroke-dashoffset] duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]"
        />
        <text
          aria-hidden="true"
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          className="fill-[var(--foreground)] [font-family:var(--font-numeric)] [font-variant-numeric:var(--font-numeric-variant)]"
        >
          {completed}/{total}
        </text>
      </svg>
    )
  },
)
ProgressRing.displayName = "ProgressRing"

export { ProgressRing }
