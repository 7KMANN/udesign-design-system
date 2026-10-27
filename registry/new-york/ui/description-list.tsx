import * as React from "react"

import { cn } from "@/lib/utils"

// Labels and their values read at a glance, such as a product's specifications (D-57): each label
// semibold beside its muted value, the labels' column as wide as the longest, within 72
// characters, as UDesign Pages sets them. A dt and dd pair may sit in a div, as HTML allows: the div
// steps aside so the pair stays on the grid. Static twin: ud-description-list.
const DescriptionList = React.forwardRef<HTMLDListElement, React.HTMLAttributes<HTMLDListElement>>(({ className, ...props }, ref) => (
  <dl
    ref={ref}
    data-slot="description-list"
    className={cn("m-0 grid max-w-[72ch] grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-3 [&>div]:contents", className)}
    {...props}
  />
))
DescriptionList.displayName = "DescriptionList"

const DescriptionTerm = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ className, ...props }, ref) => (
  <dt ref={ref} className={cn("font-semibold", className)} {...props} />
))
DescriptionTerm.displayName = "DescriptionTerm"

// A long value wraps inside its column, never past the list's edge.
const DescriptionDetails = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ className, ...props }, ref) => (
  <dd ref={ref} className={cn("m-0 min-w-0 text-[var(--muted-foreground)] [overflow-wrap:anywhere]", className)} {...props} />
))
DescriptionDetails.displayName = "DescriptionDetails"

export { DescriptionDetails, DescriptionList, DescriptionTerm }
