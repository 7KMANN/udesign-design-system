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
