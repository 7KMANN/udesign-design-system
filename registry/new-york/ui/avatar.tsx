import { cn } from "@/lib/utils"

export interface AvatarProps {
  /** The person's name. The avatar shows the first letter of its first word. */
  name: string
  size?: "md" | "lg"
  className?: string
}

const sizes = {
  md: "size-8 text-sm",
  lg: "size-10 text-base",
} as const

// The initial of the first word, uppercased with Quebec French rules. Array.from keeps a
// letter outside the basic plane whole.
function initial(name: string) {
  const [first = ""] = Array.from(name.trim())
  return first.toLocaleUpperCase("fr-CA")
}

// Decorative: a person's name always stands beside it, so assistive technology reads the
// name once and skips the letter. Never place it alone.
function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full border border-[var(--tone-brand-border)] bg-[var(--tone-brand-surface)] font-semibold leading-none text-[var(--tone-brand-foreground)]",
        sizes[size],
        className,
      )}
    >
      {initial(name)}
    </span>
  )
}

export { Avatar }
