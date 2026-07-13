# Design Specification: UDesign Showcase React Upgrade

*   **Status**: Approved
*   **Date**: 2026-07-13
*   **Author**: Antigravity
*   **Topic**: Upgrade the design system showcase from a static HTML page to a modern React, Vite, TypeScript, and Tailwind CSS stack.

---

## 1. Objective

Upgrade the UDesign design system preview workspace (`showcase/`) to a modern React and Tailwind CSS stack. By moving away from static HTML, we aim to:
1.  **Reflect Production Code**: Emulate the actual coding patterns, components, and responsive grids (e.g., Radix primitives, Tailwind utility styles) used in UDesign applications (such as the Leads Tool).
2.  **Ensure Design System Integrity**: Ensure the preview environment is strictly driven by the design tokens compiled via `style-dictionary` into `dist/tokens.css`.
3.  **Provide High-Fidelity Components**: Build high-quality, reusable React primitives styled with Tailwind and connected to custom variables.

---

## 2. Architecture & Tooling

We will place the showcase build system directly in the root workspace, minimizing overhead while maintaining clean code segregation.

### 2.1 Workspace Layout
```
/ (root)
├── package.json (Updated with React, Vite, TS, Tailwind CSS, Lucide icons, Radix primitives)
├── vite.config.ts (Configured to build/serve showcase/index.html and source)
├── tailwind.config.ts (Configured to map utility classes to Style-Dictionary variables)
├── dist/
│   └── tokens.css (Style Dictionary compiled tokens - read-only target)
└── showcase/
    ├── index.html (Vite dev server entry point)
    ├── src/
    │   ├── main.tsx (React application bootstrap)
    │   ├── App.tsx (Main application shell, page routers, viewport toggle)
    │   ├── index.css (Tailwind directives + custom scrollbars)
    │   ├── components/ (UDesign component primitives)
    │   │   ├── Button.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Card.tsx
    │   │   └── Select.tsx
    │   └── pages/ (Migrated interactive layouts)
    │       ├── KitchenSink.tsx (Color, type, radius, spacing guides)
    │       ├── Login.tsx (Interactive auth page)
    │       ├── Dashboard.tsx (Bento panels + compact tables)
    │       └── Analytics.tsx (High-contrast charts & sparklines)
```

### 2.2 Core Dependencies
We will install the following packages as `devDependencies` in the root `package.json`:
*   `react`, `react-dom` (v18+)
*   `vite` (v5+ / v6+)
*   `tailwindcss` (v3+ or v4 - we will use standard tailwindcss configuration compatible with the project)
*   `lucide-react` (icon kit)
*   `typescript` (for type-safety)
*   `@types/react`, `@types/react-dom`
*   `@radix-ui/react-select` (for robust dropdown select behaviors)

---

## 3. Token & Tailwind Configuration

Tailwind's theme will map its utility names directly to the compiled design system properties. This guarantees that modifying `tokens/udesign.tokens.json` and running `npm run build` instantly updates both the token stylesheets and the Tailwind compilation classes in the preview.

### 3.1 Mapping Schema
```typescript
// tailwind.config.ts mapping details
colors: {
  'ud-accent-wash': 'var(--ud-accent-wash)',
  'ud-accent': 'var(--ud-accent)',
  'ud-accent-deep': 'var(--ud-accent-deep)',
  'ud-cream': 'var(--ud-cream)',
  'ud-ink': 'var(--ud-ink)',
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  card: {
    DEFAULT: 'var(--card)',
    foreground: 'var(--card-foreground)',
  },
  primary: {
    DEFAULT: 'var(--primary)',
    foreground: 'var(--primary-foreground)',
    hover: 'var(--primary-hover)',
  },
  secondary: {
    DEFAULT: 'var(--secondary)',
    foreground: 'var(--secondary-foreground)',
  },
  border: 'var(--border-color)',
  destructive: 'var(--destructive)',
  client: 'var(--client)',
}
```

---

## 4. Component Primitives

We will write clean, well-typed React wrappers matching the design guidelines defined in `DESIGN.md`.

### 4.1 Button (`showcase/src/components/Button.tsx`)
```tsx
import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", ...props }, ref) => {
    const baseClass = "inline-flex items-center justify-center gap-2 font-display font-semibold text-[14.5px] rounded transition-colors cursor-pointer py-[11px] px-[20px] border border-transparent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ud-accent-wash focus-visible:ring-offset-2";
    
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
      secondary: "bg-secondary text-secondary-foreground border-border hover:bg-ud-panel-2",
      outline: "bg-transparent border-[1.5px] border-foreground text-foreground hover:bg-foreground hover:text-white"
    };

    return (
      <button
        ref={ref}
        className={`${baseClass} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
```

### 4.2 Badge (`showcase/src/components/Badge.tsx`)
Standard pill-shaped status indicator following UDesign's low-opacity state pattern.
```tsx
import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive";
}

export const Badge: React.FC<BadgeProps> = ({ className = "", variant = "default", children, ...props }) => {
  const baseClass = "inline-flex items-center font-display font-semibold text-[11px] px-[10px] py-[4px] rounded-pill border border-transparent";
  
  const variants = {
    default: "bg-foreground text-client",
    success: "bg-emerald-100/50 text-emerald-700 border-emerald-200",
    warning: "bg-yellow-100/50 text-yellow-700 border-yellow-200",
    destructive: "bg-red-100/50 text-red-700 border-red-200"
  };

  return (
    <span className={`${baseClass} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
```

---

## 5. Preview Shell Features

The showcase layout will load the application viewports within a responsive control panel:
*   **Viewport Sizer**: Sets the width of the page container class to `.desktop` (max 1200px), `.tablet` (max 768px), or `.mobile` (max 375px) with CSS transitions.
*   **Page Router**: Uses a basic React state hook to display the active view component (`KitchenSink`, `Login`, `Dashboard`, or `Analytics`).
*   **Token Version Injection**: A dropdown containing historical versions. Selecting a version changes the `<link id="tokens-link">` tag to load CSS files like `../history/{version}/tokens.css` dynamically.

---

## 6. Spec Self-Review Check

1.  **Placeholder Scan**: All code outlines are specific and map to variables. No "TODO" or "TBD" tags exist in the specification.
2.  **Internal Consistency**: Directory paths match standard Vite configurations, and dependency definitions align with Tailwind's standard setup.
3.  **Scope Check**: This spec describes the frontend upgrade only. It is appropriately scoped and does not require complex sub-packages.
