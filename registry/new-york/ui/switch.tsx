"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn("group peer relative inline-flex h-[var(--touch-target-min)] w-12 shrink-0 cursor-pointer items-center px-0.5 after:absolute after:left-0.5 after:h-6 after:w-11 after:rounded-full after:bg-[var(--interactive-disabled)] after:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed data-[state=checked]:after:bg-[var(--primary)]", className)}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none z-10 block size-5 rounded-full bg-[var(--background)] shadow-[var(--shadow-1)] transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 group-disabled:bg-[var(--interactive-disabled-foreground)]" />
    </SwitchPrimitive.Root>
  ),
)
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }
