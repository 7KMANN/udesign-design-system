import * as React from "react"

import { cn } from "@/lib/utils"

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  scrollLabel?: string
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, scrollLabel = "Scrollable table", ...props }, ref) => (
    <div aria-label={scrollLabel} className="relative w-full overflow-x-auto" role="region" tabIndex={0}>
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  ),
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />,
)
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />,
)
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tfoot ref={ref} className={cn("border-t bg-[var(--muted)] font-medium", className)} {...props} />,
)
TableFooter.displayName = "TableFooter"

// No pressed state: a <tr> cannot take focus or a key press, so press styling
// would promise a click the keyboard cannot make. A clickable row is Pressable.
const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => <tr ref={ref} className={cn("min-h-[var(--touch-target-min)] border-b transition-[background-color] duration-[var(--motion-duration-instant)] ease-[var(--motion-easing-standard)] hover:bg-[var(--interactive-hover)] data-[state=selected]:bg-[var(--interactive-selected)]", className)} {...props} />,
)
TableRow.displayName = "TableRow"

// `numeric` marks a column of figures: right-aligned, and rendered by the
// profile's numeric pair, so operations columns are tabular mono (D-19).
const numeric = "text-right [font-family:var(--font-numeric)] [font-variant-numeric:var(--font-numeric-variant)]"

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, numeric: isNumeric, ...props }, ref) => <th ref={ref} className={cn("h-[var(--touch-target-min)] px-4 text-left align-middle font-medium text-[var(--muted-foreground)]", isNumeric && "text-right", className)} {...props} />,
)
TableHead.displayName = "TableHead"

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, numeric: isNumeric, ...props }, ref) => <td ref={ref} className={cn("h-[var(--touch-target-min)] px-4 py-[var(--surface-padding,1rem)] align-middle", isNumeric && numeric, className)} {...props} />,
)
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => <caption ref={ref} className={cn("mt-4 text-sm text-[var(--muted-foreground)]", className)} {...props} />,
)
TableCaption.displayName = "TableCaption"

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow }
