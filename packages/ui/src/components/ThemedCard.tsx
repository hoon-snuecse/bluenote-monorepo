'use client';

import * as React from 'react';
import { cn } from '../utils/cn';
import { useTheme } from '../theme/ThemeContext';

export interface ThemedCardProps extends React.HTMLAttributes<HTMLDivElement> {}

const ThemedCard = React.forwardRef<HTMLDivElement, ThemedCardProps>(
  ({ className, ...props }, ref) => {
    const { theme } = useTheme();
    
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border transition-all duration-200',
          theme.colors.surface,
          theme.colors.border,
          theme.effects.blur,
          theme.effects.shadow,
          className
        )}
        {...props}
      />
    );
  }
);
ThemedCard.displayName = 'ThemedCard';

const ThemedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6 flex flex-col space-y-1.5', className)}
    {...props}
  />
));
ThemedCardHeader.displayName = 'ThemedCardHeader';

const ThemedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  
  return (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        theme.colors.text,
        className
      )}
      {...props}
    />
  );
});
ThemedCardTitle.displayName = 'ThemedCardTitle';

const ThemedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  
  return (
    <p
      ref={ref}
      className={cn('text-sm', theme.colors.textMuted, className)}
      {...props}
    />
  );
});
ThemedCardDescription.displayName = 'ThemedCardDescription';

const ThemedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
ThemedCardContent.displayName = 'ThemedCardContent';

export { 
  ThemedCard, 
  ThemedCardHeader, 
  ThemedCardTitle, 
  ThemedCardDescription, 
  ThemedCardContent 
};