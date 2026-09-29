"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn("group inline-flex size-[var(--touch-target-min)] shrink-0 items-center justify-center rounded-[var(--radius)] transition-[transform,background-color,color] duration-[var(--motion-duration-instant)] ease-[var(--motion-easing-standard)] active:scale-[var(--motion-press-scale)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--interactive-focus)] disabled:cursor-not-allowed [&:active>span]:bg-[var(--interactive-pressed)] [&[data-state=checked]:active>span]:border-[var(--primary-hover)] [&[data-state=checked]:active>span]:bg-[var(--primary-hover)]", className)}
      {...props}
    >
      <span className="flex size-5 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] text-[var(--primary-foreground)] group-data-[state=checked]:border-[var(--primary)] group-data-[state=checked]:bg-[var(--primary)] group-disabled:border-[var(--interactive-disabled-foreground)] group-disabled:bg-[var(--interactive-disabled)] group-disabled:text-[var(--interactive-disabled-foreground)]">
        <CheckboxPrimitive.Indicator><Check className="size-4" /></CheckboxPrimitive.Indicator>
      </span>
    </CheckboxPrimitive.Root>
  ),
)
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
