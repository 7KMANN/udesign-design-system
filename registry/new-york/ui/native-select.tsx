import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

export interface NativeSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "multiple" | "size"> {}

/**
 * The platform's own select, dressed as SelectTrigger: the same tokens, height,
 * radius, focus ring, hover, press, disabled and invalid states, and the same
 * chevron. Choose it over Select for a long list, a dense grid of many selects,
 * or a phone, where the system picker serves better (DESIGN.md "Choosing a
 * select"). Opening it changes nothing on <body>, so a choice restyles one
 * control instead of the whole page.
 *
 * className and style size and place the control: they land on the wrapper that
 * also holds the chevron. Every other prop, and the ref, reach the <select>.
 * One choice from a list; several choices are checkboxes, not `multiple`.
 */
const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(({ className, style, ...props }, ref) => (
  <div
    data-slot="native-select"
    // The press scales the wrapper, so the chevron moves with the field.
    className={cn(
      "relative w-full transition-[transform,scale] duration-[var(--motion-duration-instant)] ease-[var(--motion-easing-standard)] has-[select:active]:scale-[var(--motion-press-scale)]",
      className,
    )}
    style={style}
  >
    <select
      ref={ref}
      className={cn(
        // text-base below md, as Input does: iOS zooms the page into a field under 16px.
        "peer h-[var(--control-height)] min-h-[var(--touch-target-min)] w-full appearance-none rounded-[var(--radius)] border border-[var(--input)] bg-[var(--background)] py-2 pl-3 pr-9 text-base text-[var(--foreground)] transition-[background-color,color] duration-[var(--motion-duration-instant)] ease-[var(--motion-easing-standard)] hover:bg-[var(--interactive-hover)] active:bg-[var(--interactive-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--interactive-focus)] disabled:cursor-not-allowed disabled:bg-[var(--interactive-disabled)] disabled:text-[var(--interactive-disabled-foreground)] aria-[invalid=true]:border-[var(--tone-danger-foreground)] md:text-sm",
        // The platform draws the open list. Where it honours option colours (Windows,
        // Linux, Firefox) they follow the theme instead of a light default.
        "[&_optgroup]:bg-[var(--popover)] [&_optgroup]:text-[var(--popover-foreground)] [&_option]:bg-[var(--popover)] [&_option]:text-[var(--popover-foreground)]",
      )}
      {...props}
    />
    {/* Where SelectTrigger's sits: its 12px padding plus its 1px border from the edge. */}
    <ChevronDown
      aria-hidden="true"
      className="pointer-events-none absolute right-[calc(0.75rem_+_1px)] top-1/2 size-4 -translate-y-1/2 text-[var(--foreground)] opacity-60 peer-disabled:text-[var(--interactive-disabled-foreground)]"
    />
  </div>
))
NativeSelect.displayName = "NativeSelect"

export { NativeSelect }
