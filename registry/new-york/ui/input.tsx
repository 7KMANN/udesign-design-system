import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-[var(--control-height)] min-h-[var(--touch-target-min)] w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-base text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[var(--interactive-disabled)] disabled:text-[var(--interactive-disabled-foreground)] md:text-sm",
      className,
    )}
    {...props}
  />
))
Input.displayName = "Input"

export { Input }
