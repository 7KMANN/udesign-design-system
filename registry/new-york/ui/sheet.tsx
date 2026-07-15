"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close
const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>>(
  ({ className, ...props }, ref) => <SheetPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-[var(--backdrop)] opacity-60", className)} {...props} />,
)
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

export interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  closeLabel?: string
  side?: "top" | "right" | "bottom" | "left"
}

const sides = {
  top: "inset-x-0 top-0 border-b",
  right: "inset-y-0 right-0 w-full border-l sm:max-w-md",
  bottom: "inset-x-0 bottom-0 border-t pb-[max(var(--content-gutter-mobile),var(--safe-area-bottom))]",
  left: "inset-y-0 left-0 w-full border-r sm:max-w-md",
} as const

const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(
  ({ children, className, closeLabel = "Close", side = "right", ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn("fixed z-50 grid max-h-[var(--dialog-block-size-max)] gap-4 overflow-y-auto border-[var(--border)] bg-[var(--surface-raised)] p-[var(--content-gutter-mobile)] text-[var(--surface-raised-foreground)] shadow-[var(--shadow-3)] sm:p-6", sides[side], className)}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute right-2 top-2 inline-flex size-[var(--touch-target-min)] items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--interactive-hover)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-focus)]">
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">{closeLabel}</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  ),
)
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col gap-1.5 text-left", className)} {...props} />
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Title>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>>(
  ({ className, ...props }, ref) => <SheetPrimitive.Title ref={ref} className={cn("[font-family:var(--font-display)] text-lg font-semibold", className)} {...props} />,
)
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Description>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>>(
  ({ className, ...props }, ref) => <SheetPrimitive.Description ref={ref} className={cn("text-sm text-[var(--muted-foreground)]", className)} {...props} />,
)
SheetDescription.displayName = SheetPrimitive.Description.displayName

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger }
