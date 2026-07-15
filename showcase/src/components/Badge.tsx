import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'progress' | 'brand';
  solid?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'neutral', solid = false, children, ...props }, ref) => (
    <span
      ref={ref}
      className={`ud-badge tone-${variant}${solid ? ' tone-solid' : ''} ${className}`}
      {...props}
    >
      <span className="ud-badge__marker" aria-hidden="true" />
      {children}
    </span>
  ),
);

Badge.displayName = 'Badge';
