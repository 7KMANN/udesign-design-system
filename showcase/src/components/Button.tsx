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
