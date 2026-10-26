"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close
const SheetPortal = SheetPrimitive.Portal

// Whether the content renders its close button, so the title row keeps clear of it only then.
const SheetCloseRoom = React.createContext(true)

const SheetOverlay = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>>(
  ({ className, ...props }, ref) => <SheetPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-[var(--backdrop)] opacity-60", className)} {...props} />,
)
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

export interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  /** Accessible name for the close button. English by default: pass the interface's language (fr-CA first). */
  closeLabel?: string
  /**
   * Disables the close button, for example while the sheet's action runs.
   * Only the button: Escape and a press outside still call onOpenChange(false),
   * and the caller decides there, ignoring the close while the action runs.
   */
  closeDisabled?: boolean
  /**
   * Renders no close button. Escape and a press outside still call
   * onOpenChange(false), and the sheet needs another visible way out,
   * such as a Cancel button in its footer.
   */
  hideClose?: boolean
  side?: "top" | "right" | "bottom" | "left"
}

const sides = {
  top: "inset-x-0 top-0 border-b",
  right: "inset-y-0 right-0 w-full border-l sm:max-w-md",
  bottom: "inset-x-0 bottom-0 border-t pb-[max(var(--content-gutter-mobile),var(--safe-area-bottom))]",
  left: "inset-y-0 left-0 w-full border-r sm:max-w-md",
} as const

const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(
  ({ children, className, closeDisabled = false, closeLabel = "Close", hideClose = false, side = "right", ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn("fixed z-50 flex max-h-[var(--dialog-block-size-max)] flex-col gap-4 overflow-y-auto border-[var(--border)] bg-[var(--surface-raised)] [--surface-padding-default:var(--content-gutter-mobile)] sm:[--surface-padding-default:1.5rem] p-[var(--surface-padding,var(--surface-padding-default))] text-[var(--surface-raised-foreground)] [box-shadow:var(--shadow-3)]", sides[side], className)}
        {...props}
      >
        <SheetCloseRoom.Provider value={!hideClose}>{children}</SheetCloseRoom.Provider>
        {hideClose ? null : (
          <SheetPrimitive.Close
            disabled={closeDisabled}
            className="absolute right-2 top-2 inline-flex size-[var(--touch-target-min)] items-center justify-center rounded-[var(--radius)] text-[var(--muted-foreground)] transition-[transform,scale,background-color,color] duration-[var(--motion-duration-instant)] ease-[var(--motion-easing-standard)] active:scale-[var(--motion-press-scale)] active:bg-[var(--interactive-pressed)] hover:bg-[var(--interactive-hover)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-focus)] disabled:pointer-events-none disabled:bg-[var(--interactive-disabled)] disabled:text-[var(--interactive-disabled-foreground)]"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">{closeLabel}</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  ),
)
SheetContent.displayName = SheetPrimitive.Content.displayName

// The header holds no room for the close button: only the title row does (SheetTitle), so the
// description and anything placed in it run the full width, out to the footer's edge.
const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col gap-1.5 text-left", className)} {...props} />
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
SheetFooter.displayName = "SheetFooter"

// The title row is the close button's room. The button sits 8px from the corner, a 44px
// target around a 16px icon, so the icon ends 38px below the top edge. pr-10 keeps a long
// title clear of it at every --surface-padding. The min-height (38px, plus a 4px gap, less
// the header's 6px gap and the padding) starts the next row under the icon, which only
// operations' 12px padding needs: elsewhere a one-line title is already taller.
const closeRoom = "min-h-[calc(2.25rem_-_var(--surface-padding,var(--surface-padding-default)))] pr-10"

const SheetTitle = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Title>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>>(
  ({ className, ...props }, ref) => {
    const room = React.useContext(SheetCloseRoom)
    return <SheetPrimitive.Title ref={ref} className={cn("[font-family:var(--font-display)] text-[length:var(--text-h3)] font-semibold", room && closeRoom, className)} {...props} />
  },
)
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Description>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>>(
  ({ className, ...props }, ref) => <SheetPrimitive.Description ref={ref} className={cn("text-sm text-[var(--muted-foreground)]", className)} {...props} />,
)
SheetDescription.displayName = SheetPrimitive.Description.displayName

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger }
