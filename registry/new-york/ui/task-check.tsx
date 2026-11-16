"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"

import { cn } from "@/lib/utils"

// Task tool scenario (D-65). Reads the --task-* tokens, which exist only under
// data-scenario="task": render it inside a region that opts in.
export type TaskCheckHue = "day" | "business" | "ideas" | "dev"

// Whole class strings, so Tailwind sees each one. The hue is a kind of work, never a status.
const HUE: Record<TaskCheckHue, string> = {
  day: "[--task-check-hue:var(--task-cat-day)]",
  business: "[--task-check-hue:var(--task-cat-business)]",
  ideas: "[--task-check-hue:var(--task-cat-ideas)]",
  dev: "[--task-check-hue:var(--task-cat-dev)]",
}

export interface TaskCheckProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, "checked" | "defaultChecked" | "onCheckedChange" | "aria-label"> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** The list the task belongs to: ring and fill take its hue. */
  hue: TaskCheckHue
  /** The task's title. The check has no visible label of its own. */
  "aria-label": string
}

/**
 * The tick of a task row: a rounded square in the list's hue. The fill flips on the instant
 * role and the check draws as a stroke over --task-hold; under reduced motion it appears at
 * once. The row, not the box, is the hit area: the consumer lays the row out around it, with
 * the check as the row's Tab stop and Space to tick.
 */
const TaskCheck = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, TaskCheckProps>(
  ({ checked, onCheckedChange, hue, className, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={checked}
      onCheckedChange={(value) => onCheckedChange(value === true)}
      data-hue={hue}
      className={cn(
        "group inline-grid size-[var(--task-hit)] max-h-[var(--task-row-height)] shrink-0 cursor-pointer place-items-center rounded-[var(--task-radius)] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--interactive-focus)] disabled:cursor-not-allowed",
        HUE[hue],
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="grid size-[var(--task-box)] place-items-center rounded-[calc(var(--task-radius)-1px)] border-2 border-[color:var(--task-check-hue)] text-[color:var(--task-cat-on)] transition-[transform,scale,background-color,border-color,color] duration-[var(--motion-duration-instant)] ease-[var(--motion-easing-standard)] group-active:scale-[var(--motion-press-scale)] group-active:bg-[var(--interactive-pressed)] group-data-[state=checked]:bg-[var(--task-check-hue)] [@media(hover:hover)]:group-hover:group-data-[state=unchecked]:text-[color:var(--task-check-hue)] group-disabled:border-[var(--interactive-disabled-foreground)] group-disabled:bg-[var(--interactive-disabled)]"
      >
        <svg viewBox="0 0 16 16" className="size-[70%] fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2.6]">
          <path
            d="M3.6 8.4l2.9 2.9 5.9-6.4"
            pathLength={1}
            className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset,opacity] duration-[var(--task-hold)] ease-[var(--motion-easing-standard)] motion-reduce:transition-none group-data-[state=checked]:[stroke-dashoffset:0] [@media(hover:hover)]:group-hover:group-data-[state=unchecked]:opacity-40 [@media(hover:hover)]:group-hover:group-data-[state=unchecked]:[stroke-dashoffset:0]"
          />
        </svg>
      </span>
    </CheckboxPrimitive.Root>
  ),
)
TaskCheck.displayName = "TaskCheck"

export { TaskCheck }
