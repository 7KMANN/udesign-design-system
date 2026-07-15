import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  size?: "compact" | "default" | "icon"
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link"
}

const buttonVariants = {
  default: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]",
  secondary: "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--interactive-hover)]",
  outline: "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--interactive-hover)]",
  ghost: "text-[var(--foreground)] hover:bg-[var(--interactive-hover)]",
  destructive: "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90",
  link: "h-auto min-h-[var(--touch-target-min)] px-1 text-[var(--foreground)] underline-offset-4 hover:underline",
} as const

const buttonSizes = {
  compact: "h-[var(--control-height-compact)] min-h-[var(--touch-target-min)] px-3 text-sm",
  default: "h-[var(--control-height)] min-h-[var(--touch-target-min)] px-4 py-2",
  icon: "size-[var(--touch-target-min)] p-0",
} as const

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size = "default", variant = "default", ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-[var(--interactive-disabled)] disabled:text-[var(--interactive-disabled-foreground)]",
          buttonVariants[variant],
          buttonSizes[size],
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonSizes, buttonVariants }
