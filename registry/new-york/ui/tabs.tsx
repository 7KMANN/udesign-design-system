"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
  ({ className, ...props }, ref) => <TabsPrimitive.List ref={ref} className={cn("inline-flex min-h-[var(--touch-target-min)] items-center rounded-[var(--radius)] bg-[var(--muted)] p-1 text-[var(--muted-foreground)]", className)} {...props} />,
)
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
  ({ className, ...props }, ref) => <TabsPrimitive.Trigger ref={ref} className={cn("inline-flex min-h-[var(--touch-target-min)] items-center justify-center whitespace-nowrap rounded-[var(--radius-sm)] border border-transparent px-3 py-1.5 text-sm font-medium transition-[transform,background-color,color] duration-[var(--motion-duration-instant)] ease-[var(--motion-easing-standard)] active:scale-[var(--motion-press-scale)] active:bg-[var(--interactive-pressed)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--interactive-focus)] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-[var(--interactive-selected-border)] data-[state=active]:bg-[var(--interactive-selected)] data-[state=active]:text-[var(--interactive-selected-foreground)]", className)} {...props} />,
)
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(
  ({ className, ...props }, ref) => <TabsPrimitive.Content ref={ref} className={cn("mt-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--interactive-focus)]", className)} {...props} />,
)
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsContent, TabsList, TabsTrigger }
