import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

export interface PressableProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

/**
 * A clickable surface - a card, a table row, a list item. Renders a real
 * button, so Enter, Space, focus, and the accessible name come from the
 * platform rather than from a div with an onClick and a role attribute.
 *
 * Uses the subtle press scale: the control scale reads as a layout bug across
 * a full-width surface.
 */
const Pressable = React.forwardRef<HTMLButtonElement, PressableProps>(({ asChild = false, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      ref={ref}
      className={cn(
        "block w-full min-h-[var(--touch-target-min)] cursor-pointer text-left transition-[transform,background-color,border-color] duration-[var(--motion-duration-instant)] ease-[var(--motion-easing-standard)] hover:bg-[var(--interactive-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-focus)] focus-visible:ring-offset-2 active:scale-[var(--motion-press-scale-subtle)] active:bg-[var(--interactive-pressed)] disabled:pointer-events-none disabled:bg-[var(--interactive-disabled)] disabled:text-[var(--interactive-disabled-foreground)]",
        className,
      )}
      {...props}
    />
  )
})
Pressable.displayName = "Pressable"

export { Pressable }
