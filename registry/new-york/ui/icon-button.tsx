import * as React from "react"

import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface IconButtonProps extends Omit<ButtonProps, "aria-label" | "children" | "size"> {
  icon: React.ReactNode
  label: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(({ className, icon, label, ...props }, ref) => (
  <Button ref={ref} aria-label={label} className={cn("size-[var(--touch-target-min)] shrink-0", className)} size="icon" {...props}>
    {icon}
  </Button>
))
IconButton.displayName = "IconButton"

export { IconButton }
