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
