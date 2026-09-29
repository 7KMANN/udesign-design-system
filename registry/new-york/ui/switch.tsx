"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn("group peer relative inline-flex h-[var(--touch-target-min)] w-12 shrink-0 cursor-pointer items-center px-0.5 transition-[transform,background-color,color] duration-[var(--motion-duration-instant)] ease-[var(--motion-easing-standard)] active:scale-[var(--motion-press-scale)] after:absolute after:left-0.5 after:h-6 after:w-11 after:rounded-full after:border after:border-[var(--muted-foreground)] after:bg-[var(--muted)] after:transition-[background-color] after:duration-[var(--motion-duration-fast)] after:ease-[var(--motion-easing-standard)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--interactive-focus)] disabled:cursor-not-allowed data-[state=checked]:after:border-[var(--primary)] data-[state=checked]:after:bg-[var(--primary)] [&[data-state=unchecked]:active::after]:bg-[var(--interactive-pressed)] [&[data-state=checked]:active::after]:border-[var(--primary-hover)] [&[data-state=checked]:active::after]:bg-[var(--primary-hover)] [&:disabled[data-state=unchecked]::after]:border-[var(--border)] [&:disabled[data-state=unchecked]::after]:bg-[var(--interactive-disabled)]", className)}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none z-10 block size-5 rounded-full bg-[var(--muted-foreground)] [box-shadow:var(--shadow-1)] transition-transform duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)] data-[state=checked]:translate-x-[1.375rem] data-[state=checked]:bg-[var(--background)] data-[state=unchecked]:translate-x-0.5 group-disabled:bg-[var(--interactive-disabled-foreground)]" />
    </SwitchPrimitive.Root>
  ),
)
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }
