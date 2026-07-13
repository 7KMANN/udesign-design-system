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
