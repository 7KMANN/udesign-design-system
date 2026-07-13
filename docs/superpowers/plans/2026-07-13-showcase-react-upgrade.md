# UDesign Showcase React Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the design system preview showcase to a modern React + Vite + TypeScript + Tailwind CSS application that imports and exercises our Style Dictionary tokens.

**Architecture:** We will set up the tooling directly in the project root, keeping the showcase source code isolated inside `showcase/src/`. The Tailwind configuration will map standard utilities directly to our CSS custom properties generated in `dist/tokens.css`.

**Tech Stack:** React, Vite, TypeScript, Tailwind CSS, Radix Select, Lucide Icons.

## Global Constraints
* Naming and Style: Components must adhere strictly to `DESIGN.md` rules (e.g. 1px borders, zero-shadows except popovers, Montserrat for display, Geist/JetBrains Mono for data).
* Relative Token Loading: The showcase must load tokens from `../dist/tokens.css` or historical directories relative to its serving environment.
* Dev Server Port: Default dev port is 3000.

---

### Task 1: Toolchain Scaffolding

Configure root-level development dependencies and set up configurations for Vite, TypeScript, and Tailwind CSS.

**Files:**
* Modify: `package.json`
* Create: `vite.config.ts`
* Create: `tsconfig.json`
* Create: `tailwind.config.js`
* Create: `postcss.config.js`

**Interfaces:**
* Consumes: `dist/tokens.css`
* Produces: Root compiler rules and build pipelines for React files.

- [ ] **Step 1: Add dependencies to root `package.json`**

Edit `package.json` to append the devDependencies and standard dev script.
```json
{
  "name": "udesign-design-system",
  "version": "1.0.0",
  "private": true,
  "license": "SEE LICENSE IN LICENSE.md",
  "description": "UDesign brand design tokens: single source of truth, consumed via git dependency.",
  "type": "module",
  "main": "dist/tokens.css",
  "files": [
    "dist",
    "tokens",
    "README.md",
    "CHANGELOG.md",
    "LICENSE.md"
  ],
  "scripts": {
    "build": "node scripts/build.mjs",
    "release": "node scripts/release.mjs",
    "dev": "vite",
    "build-showcase": "tsc && vite build"
  },
  "devDependencies": {
    "@radix-ui/react-select": "^2.1.1",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "lucide-react": "^0.435.0",
    "postcss": "^8.4.41",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "style-dictionary": "^4.0.1",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.5.4",
    "vite": "^5.4.1"
  }
}
```

- [ ] **Step 2: Run npm install**

Run: `npm install`
Expected: Installation completes successfully without conflicts.

- [ ] **Step 3: Create `tsconfig.json`**

Create `tsconfig.json` in the root:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["showcase/src", "vite.config.ts"]
}
```

- [ ] **Step 4: Create `vite.config.ts`**

Create `vite.config.ts` in the root:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'showcase'),
  build: {
    outDir: path.resolve(__dirname, 'dist-showcase'),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    fs: {
      allow: ['..']
    }
  }
});
```

- [ ] **Step 5: Create `tailwind.config.js`**

Create `tailwind.config.js` in the root:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./showcase/index.html",
    "./showcase/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primitives
        'ud-accent-wash': 'var(--ud-accent-wash)',
        'ud-accent-300': 'var(--ud-accent-300)',
        'ud-accent-400': 'var(--ud-accent-400)',
        'ud-accent': 'var(--ud-accent)',
        'ud-accent-deep': 'var(--ud-accent-deep)',
        'ud-cream': 'var(--ud-cream)',
        'ud-ink': 'var(--ud-ink)',
        'ud-white': 'var(--ud-white)',
        'ud-panel': 'var(--ud-panel)',
        'ud-panel-2': 'var(--ud-panel-2)',
        'ud-border': 'var(--ud-border)',
        'ud-border-strong': 'var(--ud-border-strong)',
        'ud-muted': 'var(--ud-muted)',
        'ud-muted-soft': 'var(--ud-muted-soft)',
        'ud-success': 'var(--ud-success)',
        'ud-success-bg': 'var(--ud-success-bg)',
        'ud-warning': 'var(--ud-warning)',
        'ud-warning-bg': 'var(--ud-warning-bg)',
        'ud-danger': 'var(--ud-danger)',
        'ud-danger-bg': 'var(--ud-danger-bg)',

        // Functional Roles
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
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        border: 'var(--border-color)',
        ring: 'var(--ring)',
        destructive: 'var(--destructive)',
        client: 'var(--client)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        data: ['var(--font-data)', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
      },
      boxShadow: {
        'shadow-1': 'var(--shadow-1)',
        'shadow-2': 'var(--shadow-2)',
        'shadow-3': 'var(--shadow-3)',
      }
    },
  },
  plugins: [],
}
```

- [ ] **Step 6: Create `postcss.config.js`**

Create `postcss.config.js` in the root:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 7: Verification**

Run compilation check: `npx tsc --noEmit`
Expected: Completes without error.

---

### Task 2: Setup React Entry and Style Directives

Set up the React application entry files inside `showcase/`.

**Files:**
* Modify: `showcase/index.html` (overwrite/replace)
* Create: `showcase/src/index.css`
* Create: `showcase/src/main.tsx`

**Interfaces:**
* Consumes: `vite.config.ts`, `dist/tokens.css`
* Produces: Root DOM mounts for React rendering.

- [ ] **Step 1: Replace `showcase/index.html`**

Overwrite the contents of `showcase/index.html` with a basic Vite template:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UDesign Showcase & Previewer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <!-- Tokens style tag that can be hot-swapped for version testing -->
  <link id="tokens-link" rel="stylesheet" href="../dist/tokens.css">
</head>
<body class="bg-background text-foreground min-h-screen">
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 2: Create `showcase/src/index.css`**

Create the Tailwind styles loadout file:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-display);
  }
}

/* Custom premium scrollbar for lists/tables */
.scroll-zone::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.scroll-zone::-webkit-scrollbar-track {
  background: transparent;
}
.scroll-zone::-webkit-scrollbar-thumb {
  background: var(--ring);
  opacity: 0.2;
  border-radius: 10px;
}
.scroll-zone::-webkit-scrollbar-thumb:hover {
  background: var(--primary-hover);
}
```

- [ ] **Step 3: Create `showcase/src/main.tsx`**

Create the React mounting file:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 4: Create a temporary `showcase/src/App.tsx`**

Create a temporary App.tsx to verify the dev setup runs:
```tsx
import React from 'react';

export default function App() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-display font-black text-primary">UDesign React Showcase</h1>
      <p className="mt-4 text-muted-foreground font-data">If this is gold and styled in JetBrains Mono, it works!</p>
    </div>
  );
}
```

- [ ] **Step 5: Run dev server to verify setup**

Run: `npx vite --port 3000` (runs the dev server on port 3000)
Expected: Dev server boots. Open browser, verify content styling compiles.

---

### Task 3: Implement Reusable Component Primitives

Build key React components mapped to UDesign's brutalist aesthetic variables.

**Files:**
* Create: `showcase/src/components/Button.tsx`
* Create: `showcase/src/components/Badge.tsx`
* Create: `showcase/src/components/Card.tsx`

**Interfaces:**
* Consumes: Mapped Tailwind values and HTML element props.
* Produces: Clean, importable React wrappers.

- [ ] **Step 1: Implement `Button.tsx`**

Create `showcase/src/components/Button.tsx`:
```tsx
import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", ...props }, ref) => {
    const baseClass = "inline-flex items-center justify-center gap-2 font-display font-semibold text-[14.5px] rounded transition-all cursor-pointer py-[11px] px-[20px] border border-transparent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ud-accent-wash focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
      secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-ud-panel-2",
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

- [ ] **Step 2: Implement `Badge.tsx`**

Create `showcase/src/components/Badge.tsx`:
```tsx
import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive";
}

export const Badge: React.FC<BadgeProps> = ({ className = "", variant = "default", children, ...props }) => {
  const baseClass = "inline-flex items-center font-display font-semibold text-[11px] px-[10px] py-[4px] rounded-pill border border-transparent";
  
  const variants = {
    default: "bg-foreground text-client",
    success: "bg-emerald-100/50 text-emerald-700 border border-emerald-200",
    warning: "bg-yellow-100/50 text-yellow-700 border border-yellow-200",
    destructive: "bg-red-100/50 text-red-700 border border-red-200"
  };

  return (
    <span className={`${baseClass} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
Badge.displayName = "Badge";
```

- [ ] **Step 3: Implement `Card.tsx`**

Create `showcase/src/components/Card.tsx`:
```tsx
import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", padded = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-card rounded-lg border border-border ${padded ? 'p-5' : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";
```

- [ ] **Step 4: Update temporary App.tsx to verify compilation**

Modify `showcase/src/App.tsx` to verify component compilation:
```tsx
import React from 'react';
import { Button } from './components/Button';
import { Badge } from './components/Badge';
import { Card } from './components/Card';

export default function App() {
  return (
    <div className="p-8 flex flex-col gap-6">
      <Card>
        <h2 className="text-xl font-display font-black mb-4">Component Check</h2>
        <div className="flex gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
        <div className="flex gap-4 mt-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="destructive">Critical</Badge>
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 5: Verification**

Run compilation check: `npx tsc --noEmit`
Expected: Completes without error.

---

### Task 4: Port Kitchen Sink and Login Pages

Build React versions of the original Kitchen Sink and Login views.

**Files:**
* Create: `showcase/src/pages/KitchenSink.tsx`
* Create: `showcase/src/pages/Login.tsx`

**Interfaces:**
* Consumes: Custom Button, Badge, and Card primitives.
* Produces: Page modules for the main App router.

- [ ] **Step 1: Implement `KitchenSink.tsx`**

Create `showcase/src/pages/KitchenSink.tsx`:
```tsx
import React from 'react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';

const BRAND_SWATCHES = [
  { varName: '--ud-accent-wash', label: 'wash' },
  { varName: '--ud-accent-300', label: '300' },
  { varName: '--ud-accent-400', label: '400' },
  { varName: '--ud-accent', label: 'accent' },
  { varName: '--ud-accent-deep', label: 'accent deep' },
  { varName: '--ud-cream', label: 'cream' },
  { varName: '--ud-ink', label: 'ink' },
  { varName: '--ud-white', label: 'white' },
  { varName: '--ud-panel', label: 'panel' },
  { varName: '--ud-panel-2', label: 'panel 2' },
  { varName: '--ud-border', label: 'border' },
  { varName: '--ud-border-strong', label: 'border strong' },
  { varName: '--ud-muted', label: 'muted' },
  { varName: '--ud-muted-soft', label: 'muted soft' },
  { varName: '--ud-success', label: 'success' },
  { varName: '--ud-warning', label: 'warning' },
  { varName: '--ud-danger', label: 'danger' }
];

export const KitchenSink: React.FC = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* Colors section */}
      <div>
        <h2 className="text-xl font-display font-black mb-1">Color Palette</h2>
        <p className="text-sm text-muted-foreground mb-4 font-display">Token mappings showing color names and values.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {BRAND_SWATCHES.map((swatch) => (
            <div key={swatch.varName} className="border border-border rounded overflow-hidden bg-card">
              <div className="h-12" style={{ backgroundColor: `var(${swatch.varName})` }} />
              <div className="p-2">
                <div className="font-display font-semibold text-[11px] text-foreground">{swatch.label}</div>
                <div className="font-data text-[9px] text-muted-foreground mt-0.5">{swatch.varName}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typo Section */}
      <div>
        <h2 className="text-xl font-display font-black mb-1">Typography Hierarchy</h2>
        <p className="text-sm text-muted-foreground mb-4 font-display">Hierarchy styles mapped from typography variables.</p>
        <div className="flex flex-col border-t border-border">
          {[
            { tag: 'display', cssClass: 'text-[3rem] font-black tracking-tight leading-none' },
            { tag: 'h1', cssClass: 'text-[2.1rem] font-black tracking-tight leading-tight' },
            { tag: 'h2', cssClass: 'text-[1.6rem] font-extrabold tracking-tight leading-normal' },
            { tag: 'h3', cssClass: 'text-[1.2rem] font-bold leading-normal' },
            { tag: 'body', cssClass: 'text-[1rem] font-normal leading-relaxed' },
            { tag: 'label', cssClass: 'text-[0.78rem] font-semibold text-muted-foreground uppercase tracking-wider' },
            { tag: 'data', cssClass: 'font-data text-[0.85rem] leading-normal' }
          ].map((item) => (
            <div key={item.tag} className="flex items-baseline py-3 border-b border-border gap-4">
              <div className="font-data text-[11px] text-muted-foreground w-20 flex-shrink-0">{item.tag}</div>
              <div className={item.cssClass}>UDesign Productions</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action triggers */}
      <div>
        <h2 className="text-xl font-display font-black mb-3">Action Triggers</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Agrandir la référence</Button>
          <Button variant="secondary">Comparer</Button>
          <Button variant="outline">Fiche technique</Button>
        </div>
      </div>

      {/* Spacing & Borders */}
      <div>
        <h2 className="text-xl font-display font-black mb-3">Radius & Spacing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-display font-bold text-sm mb-3">Border Radii</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'radius-sm', class: 'rounded-sm w-12 h-12 bg-primary' },
                { label: 'radius', class: 'rounded w-12 h-12 bg-primary' },
                { label: 'radius-lg', class: 'rounded-lg w-12 h-12 bg-primary' },
                { label: 'radius-pill', class: 'rounded-pill w-28 h-12 bg-primary' }
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-4">
                  <span className="font-data text-[11px] text-muted-foreground w-24">{r.label}</span>
                  <div className={r.class} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-display font-bold text-sm mb-3">Space Scales</h3>
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 6, 8].map((s) => (
                <div key={s} className="flex items-center gap-4">
                  <span className="font-data text-[11px] text-muted-foreground w-24">space-{s}</span>
                  <div className="h-4 bg-primary rounded-sm" style={{ width: `var(--space-${s})` }} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Implement `Login.tsx`**

Create `showcase/src/pages/Login.tsx`:
```tsx
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Testing authentication state:\nEmail: ${email}\nPassword Length: ${password.length}`);
  };

  return (
    <div className="min-h-[480px] flex items-center justify-center bg-background">
      <Card className="w-full max-width-[380px] p-8 max-w-sm">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 font-display font-black text-lg text-foreground mb-2">
            <span className="w-6.5 h-6.5 rounded-sm bg-foreground text-client flex items-center justify-center font-black text-[13px]">U</span>
            UDesign
          </div>
          <p className="text-xs text-muted-foreground">Accéder à votre console admin</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-semibold text-[11px] uppercase tracking-wider text-muted-foreground" htmlFor="login-email">Identifiant</label>
            <input
              id="login-email"
              type="text"
              className="w-full h-10 border border-border rounded-sm px-3 bg-card text-foreground font-display text-[13.5px] outline-none focus:border-ring focus:ring-3 focus:ring-ud-accent-wash transition-all"
              placeholder="admin@udesign.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-semibold text-[11px] uppercase tracking-wider text-muted-foreground" htmlFor="login-pass">Mot de passe</label>
            <input
              id="login-pass"
              type="password"
              className="w-full h-10 border border-border rounded-sm px-3 bg-card text-foreground font-display text-[13.5px] outline-none focus:border-ring focus:ring-3 focus:ring-ud-accent-wash transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full mt-2" variant="primary">
            Se connecter
          </Button>
        </form>
      </Card>
    </div>
  );
};
```

- [ ] **Step 3: Verification**

Run compilation check: `npx tsc --noEmit`
Expected: Completes without error.

---

### Task 5: Port Admin Dashboard and Analytics Pages

Port the final showcase pages (Admin Dashboard and Analytics) to React components.

**Files:**
* Create: `showcase/src/pages/Dashboard.tsx`
* Create: `showcase/src/pages/Analytics.tsx`

**Interfaces:**
* Consumes: Custom Button, Badge, Card primitives.
* Produces: Page components for the shell layout.

- [ ] **Step 1: Implement `Dashboard.tsx`**

Create `showcase/src/pages/Dashboard.tsx`:
```tsx
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';

const INITIAL_ROWS = [
  { id: 1, client: 'Atelier Montréal', service: 'Screen Printing', budget: '5,400.00 $', status: 'success', statusLabel: 'Nouveau', type: 'Prospect', isRush: false },
  { id: 2, client: 'GlobalVision Inc.', service: 'Embroidery Rush', budget: '12,850.00 $', status: 'warning', statusLabel: 'RUSH', type: 'Urgent', isRush: true },
  { id: 3, client: 'Studio Québec', service: 'Sublimation', budget: '1,200.00 $', status: 'success', statusLabel: 'Nouveau', type: 'Prospect', isRush: false }
];

export const Dashboard: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredRows = INITIAL_ROWS.filter(row => 
    row.client.toLowerCase().includes(search.toLowerCase()) ||
    row.service.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h1 className="text-xl font-display font-black tracking-tight">Console d'administration</h1>
        <div className="flex gap-2">
          <input
            type="text"
            className="h-9 border border-border rounded px-3 bg-card text-foreground font-display text-[12.5px] outline-none focus:border-ring focus:ring-2 focus:ring-ud-accent-wash w-48"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="secondary" className="text-[12.5px] py-1.5 px-3.5 h-9">Exporter CSV</Button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">Leads du jour</div>
          <div className="font-data text-2xl font-bold mt-1 text-primary">148</div>
        </Card>
        <Card>
          <div className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">Volume estimé</div>
          <div className="font-data text-2xl font-bold mt-1 text-foreground">42 500 $</div>
        </Card>
        <Card>
          <div className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">Taux d'engagement</div>
          <div className="font-data text-2xl font-bold mt-1 text-emerald-700">92.4 %</div>
        </Card>
      </div>

      {/* High-density Table */}
      <Card padded={false} className="overflow-hidden">
        <div className="scroll-zone overflow-x-auto">
          <table className="w-full border-collapse text-[13.5px] text-left">
            <thead>
              <tr className="bg-secondary text-muted-foreground font-display font-semibold text-[11px] uppercase tracking-wider border-b border-border">
                <th className="py-2 px-3">Client</th>
                <th className="py-2 px-3">Service</th>
                <th className="py-2 px-3">Budget</th>
                <th className="py-2 px-3">Statut</th>
                <th className="py-2 px-3">Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-border last:border-0 hover:bg-secondary/40 transition-colors ${
                    row.isRush 
                      ? 'bg-red-500/[0.04] hover:bg-red-500/[0.08]' 
                      : ''
                  }`}
                >
                  <td className={`py-1.5 px-3 font-semibold ${row.isRush ? 'border-l-[3px] border-l-destructive pl-[9px]' : ''}`}>
                    {row.isRush && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive mr-1.5 animate-pulse" />
                    )}
                    {row.client}
                  </td>
                  <td className="py-1.5 px-3 font-data">{row.service}</td>
                  <td className="py-1.5 px-3 font-data">{row.budget}</td>
                  <td className="py-1.5 px-3">
                    <Badge variant={row.isRush ? 'destructive' : 'success'}>
                      {row.statusLabel}
                    </Badge>
                  </td>
                  <td className={`py-1.5 px-3 ${row.isRush ? 'font-bold text-destructive' : ''}`}>{row.type}</td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground font-display">Aucun résultat trouvé</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
```

- [ ] **Step 2: Implement `Analytics.tsx`**

Create `showcase/src/pages/Analytics.tsx`:
```tsx
import React from 'react';
import { Card } from '../components/Card';

export const Analytics: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-display font-black">Rapports graphiques</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sparkline curve */}
        <Card className="md:col-span-2">
          <h3 className="font-display font-black text-sm mb-4">Évolution du volume de leads</h3>
          <div className="h-44 border-b-2 border-l-2 border-border flex items-end relative overflow-hidden">
            <svg viewBox="0 0 100 40" width="100%" height="100%" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-full">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              <path d="M 0 35 Q 20 15 40 25 T 80 5 T 100 10 L 100 40 L 0 40 Z" fill="url(#chart-grad)" />
              <path d="M 0 35 Q 20 15 40 25 T 80 5 T 100 10" fill="none" stroke="var(--primary)" strokeWidth="1.8" />
            </svg>
          </div>
          <div className="flex justify-between mt-2.5 font-data text-[11px] text-muted-foreground">
            <span>Lundi</span>
            <span>Mercredi</span>
            <span>Vendredi</span>
          </div>
        </Card>

        {/* Bar chart distribution */}
        <Card>
          <h3 className="font-display font-black text-sm mb-4">Répartition des ventes</h3>
          <div className="h-44 flex items-end justify-center gap-4 border-b-2 border-border pb-2">
            <div className="flex flex-col items-center flex-1">
              <div className="w-full bg-primary rounded-t-sm" style={{ height: '70%' }} />
              <span className="font-display text-[10px] font-semibold mt-2">Gold</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-full bg-secondary border border-border rounded-t-sm" style={{ height: '45%' }} />
              <span className="font-display text-[10px] font-semibold mt-2">Neutral</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-full bg-foreground rounded-t-sm" style={{ height: '90%' }} />
              <span className="font-display text-[10px] font-semibold mt-2">Ink</span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};
```

- [ ] **Step 3: Verification**

Run compilation check: `npx tsc --noEmit`
Expected: Completes without error.

---

### Task 6: Implement App Shell, Viewport Toggles, & Version Selector

Construct the responsive wrapper frames and interactive controls inside the main `App.tsx` file.

**Files:**
* Create: `showcase/src/App.tsx` (overwrite)

**Interfaces:**
* Consumes: KitchenSink, Login, Dashboard, and Analytics components.
* Produces: Fully interactive preview dashboard serving as the root interface.

- [ ] **Step 1: Write `showcase/src/App.tsx`**

Implement App shell layout, view switcher, viewport bounds modifier, and version picker linking.
```tsx
import React, { useState, useEffect } from 'react';
import { KitchenSink } from './pages/KitchenSink';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';

export default function App() {
  const [activePage, setActivePage] = useState<'kitchen-sink' | 'login' | 'dashboard' | 'analytics'>('kitchen-sink');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [versions, setVersions] = useState<string[]>([]);
  const [selectedVersionPath, setSelectedVersionPath] = useState('../dist/tokens.css');

  // Load versions array defined in history configs
  useEffect(() => {
    const fetchVersions = () => {
      // Access standard global versions variable defined inside history scripts if exists
      const globalVersions = (window as any).UD_VERSIONS || [];
      setVersions(globalVersions);
    };
    fetchVersions();
  }, []);

  // Update stylesheet href when token version picker is selected
  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedVersionPath(val);
    const linkEl = document.getElementById('tokens-link') as HTMLLinkElement;
    if (linkEl) {
      linkEl.href = val;
    }
  };

  const getViewportMaxWidth = () => {
    switch (viewport) {
      case 'mobile': return 'max-w-[375px]';
      case 'tablet': return 'max-w-[768px]';
      case 'desktop':
      default: return 'max-w-[1200px]';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfaf6] text-[#1b1b1b]">
      {/* Shell Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 px-6 bg-white border-b border-[#e4ded0] sticky top-0 z-50">
        <div className="flex items-center gap-2.5 font-display font-black text-[17px] tracking-tight">
          <span className="w-6.5 h-6.5 rounded-sm bg-[#1b1b1b] text-[#c79f6b] flex items-center justify-center font-black text-[13px]">U</span>
          UDesign Showcase & Previewer
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Page Picker */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8a8172]">
            <span>Page:</span>
            <select 
              value={activePage}
              onChange={(e) => setActivePage(e.target.value as any)}
              className="font-data text-[12px] py-1 px-2 border border-[#e4ded0] rounded bg-white text-[#1b1b1b] outline-none cursor-pointer"
            >
              <option value="kitchen-sink">Kitchen Sink</option>
              <option value="login">Login Canvas</option>
              <option value="dashboard">Admin Dashboard</option>
              <option value="analytics">Analytics & Charts</option>
            </select>
          </div>

          {/* Viewport resizing tool */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8a8172]">
            <span>Viewport:</span>
            <select
              value={viewport}
              onChange={(e) => setViewport(e.target.value as any)}
              className="font-data text-[12px] py-1 px-2 border border-[#e4ded0] rounded bg-white text-[#1b1b1b] outline-none cursor-pointer"
            >
              <option value="desktop">Desktop (1200px)</option>
              <option value="tablet">Tablet (768px)</option>
              <option value="mobile">Mobile (375px)</option>
            </select>
          </div>

          {/* Token version hook */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8a8172]">
            <span>Version:</span>
            <select
              value={selectedVersionPath}
              onChange={handleVersionChange}
              className="font-data text-[12px] py-1 px-2 border border-[#e4ded0] rounded bg-white text-[#1b1b1b] outline-none cursor-pointer"
            >
              {versions.map((v) => (
                <option key={v} value={`../history/${v}/tokens.css`}>{v}</option>
              ))}
              <option value="../dist/tokens.css">current (unreleased)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Frame wrapper viewport */}
      <div className="flex-1 p-6 flex justify-center items-start overflow-y-auto">
        <div 
          className={`w-full bg-background text-foreground font-display border border-border rounded-lg overflow-hidden shadow-2 transition-all duration-300 scroll-zone ${getViewportMaxWidth()}`}
        >
          <div className="p-8">
            {activePage === 'kitchen-sink' && <KitchenSink />}
            {activePage === 'login' && <Login />}
            {activePage === 'dashboard' && <Dashboard />}
            {activePage === 'analytics' && <Analytics />}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Clean up old files and compile full suite**

Verify the application builds successfully for production:
Run: `npm run build-showcase`
Expected: Succeeds without TypeScript compile or Vite bundle errors. Output builds into `dist-showcase/`.

---
