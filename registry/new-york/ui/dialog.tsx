"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// Whether the content renders its close button, so the title row keeps clear of it only then.
const DialogCloseRoom = React.createContext(true)

const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(
  ({ className, ...props }, ref) => <DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-[var(--backdrop)]/60", className)} {...props} />,
)
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

export interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** Accessible name for the close button. English by default: pass the interface's language (fr-CA first). */
  closeLabel?: string
  /**
   * Disables the close button, for example while the dialog's action runs.
   * Only the button: Escape and a press outside still call onOpenChange(false),
   * and the caller decides there, ignoring the close while the action runs.
   */
  closeDisabled?: boolean
  /**
   * Renders no close button. Escape and a press outside still call
   * onOpenChange(false), and the dialog needs another visible way out,
   * such as a Cancel button in its footer.
   */
  hideClose?: boolean
}

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  ({ children, className, closeDisabled = false, closeLabel = "Close", hideClose = false, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-[var(--dialog-inline-size-mobile)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-raised)] [--surface-padding-default:var(--content-gutter-mobile)] sm:[--surface-padding-default:1.5rem] p-[var(--surface-padding,var(--surface-padding-default))] text-[var(--surface-raised-foreground)] [box-shadow:var(--shadow-3)] max-h-[var(--dialog-block-size-max)]",
          className,
        )}
        {...props}
      >
        <DialogCloseRoom.Provider value={!hideClose}>{children}</DialogCloseRoom.Provider>
        {hideClose ? null : (
          <DialogPrimitive.Close
            disabled={closeDisabled}
            className="absolute right-2 top-2 inline-flex size-[var(--touch-target-min)] items-center justify-center rounded-[var(--radius)] text-[var(--muted-foreground)] transition-[transform,scale,background-color,color] duration-[var(--motion-duration-instant)] ease-[var(--motion-easing-standard)] active:scale-[var(--motion-press-scale)] active:bg-[var(--interactive-pressed)] hover:bg-[var(--interactive-hover)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-focus)] disabled:pointer-events-none disabled:bg-[var(--interactive-disabled)] disabled:text-[var(--interactive-disabled-foreground)]"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">{closeLabel}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  ),
)
DialogContent.displayName = DialogPrimitive.Content.displayName

// The header holds no room for the close button: only the title row does (DialogTitle), so the
// description and anything placed in it run the full width, out to the footer's edge.
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col gap-2 text-left", className)} {...props} />
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
DialogFooter.displayName = "DialogFooter"

// The title row is the close button's room. The button sits 8px from the corner, a 44px
// target around a 16px icon, so the icon ends 38px below the top edge. pr-10 keeps a long
// title clear of it at every --surface-padding. The min-height (38px, plus a 4px gap, less
// the header's 8px gap and the padding) starts the next row under the icon, which only
// operations' 12px padding needs: elsewhere a one-line title is already taller.
const closeRoom = "min-h-[calc(2.125rem_-_var(--surface-padding,var(--surface-padding-default)))] pr-10"

const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(
  ({ className, ...props }, ref) => {
    const room = React.useContext(DialogCloseRoom)
    return <DialogPrimitive.Title ref={ref} className={cn("[font-family:var(--font-display)] text-[length:var(--text-h3)] font-semibold leading-none", room && closeRoom, className)} {...props} />
  },
)
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(
  ({ className, ...props }, ref) => <DialogPrimitive.Description ref={ref} className={cn("text-sm text-[var(--muted-foreground)]", className)} {...props} />,
)
DialogDescription.displayName = DialogPrimitive.Description.displayName

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger }
