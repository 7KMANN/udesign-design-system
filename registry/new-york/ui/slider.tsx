"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, defaultValue, min = 0, max = 100, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...props }, ref) => {
  const thumbValues = value ?? defaultValue ?? [min]
  return (
    <SliderPrimitive.Root
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none select-none items-center data-[disabled]:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[var(--interactive-disabled)]">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-[var(--primary)] data-[disabled]:bg-[var(--interactive-disabled-foreground)]" />
      </SliderPrimitive.Track>
      {thumbValues.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className="group relative flex size-[var(--touch-target-min)] items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-focus)] focus-visible:ring-offset-2 data-[disabled]:cursor-not-allowed"
        >
          <span className="pointer-events-none block size-5 rounded-full border border-[var(--border)] bg-[var(--background)] shadow-[var(--shadow-1)] transition-colors group-data-[disabled]:border-[var(--interactive-disabled-foreground)] group-data-[disabled]:bg-[var(--interactive-disabled)]" />
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
