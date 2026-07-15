import * as React from "react"

import { cn } from "@/lib/utils"

const Field = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("grid gap-2", className)} {...props} />,
)
Field.displayName = "Field"

const FieldLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => <label ref={ref} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-60", className)} {...props} />,
)
FieldLabel.displayName = "FieldLabel"

const FieldDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn("text-sm text-[var(--muted-foreground)]", className)} {...props} />,
)
FieldDescription.displayName = "FieldDescription"

const FieldError = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, role = "alert", ...props }, ref) => <p ref={ref} role={role} className={cn("text-sm text-[var(--tone-danger-foreground)]", className)} {...props} />,
)
FieldError.displayName = "FieldError"

export { Field, FieldDescription, FieldError, FieldLabel }
