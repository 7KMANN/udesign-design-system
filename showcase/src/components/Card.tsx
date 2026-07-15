import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  surface?: 'card' | 'raised' | 'sunken' | 'overlay';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', padded = true, surface = 'card', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`ud-card ud-card--${surface}${padded ? ' ud-card--padded' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  ),
);

Card.displayName = 'Card';
