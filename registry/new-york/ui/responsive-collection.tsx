import * as React from "react"

import { cn } from "@/lib/utils"

export interface ResponsiveCollectionProps extends React.HTMLAttributes<HTMLDivElement> {
  desktop: React.ReactNode
  mobile: React.ReactNode
}

const ResponsiveCollection = React.forwardRef<HTMLDivElement, ResponsiveCollectionProps>(
  ({ className, desktop, mobile, ...props }, ref) => (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      <div className="md:hidden">{mobile}</div>
      <div className="hidden md:block">{desktop}</div>
    </div>
  ),
)
ResponsiveCollection.displayName = "ResponsiveCollection"

export { ResponsiveCollection }
