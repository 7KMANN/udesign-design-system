"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn("group inline-flex size-[var(--touch-target-min)] shrink-0 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed", className)}
      {...props}
    >
      <span className="flex size-5 items-center justify-center rounded-sm border border-[var(--border)] bg-[var(--background)] text-[var(--primary-foreground)] group-data-[state=checked]:border-[var(--primary)] group-data-[state=checked]:bg-[var(--primary)] group-disabled:border-[var(--interactive-disabled-foreground)] group-disabled:bg-[var(--interactive-disabled)] group-disabled:text-[var(--interactive-disabled-foreground)]">
        <CheckboxPrimitive.Indicator><Check className="size-4" /></CheckboxPrimitive.Indicator>
      </span>
    </CheckboxPrimitive.Root>
  ),
)
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
