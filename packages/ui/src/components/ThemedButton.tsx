'use client';

import * as React from 'react';
import { cn } from '../utils/cn';
import { useTheme } from '../theme/ThemeContext';

interface ThemedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const ThemedButton = React.forwardRef<HTMLButtonElement, ThemedButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    const { theme } = useTheme();
    
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: cn(
        theme.colors.primary,
        theme.colors.primaryHover,
        'text-white',
        theme.effects.shadow
      ),
      secondary: cn(
        'bg-slate-100',
        'hover:bg-slate-200',
        theme.colors.text
      ),
      outline: cn(
        'bg-transparent border',
        theme.colors.border,
        theme.colors.text,
        'hover:bg-slate-50'
      ),
      ghost: cn(
        'bg-transparent',
        theme.colors.text,
        'hover:bg-slate-100'
      ),
      danger: cn(
        'bg-red-500 hover:bg-red-600 text-white',
        theme.effects.shadow
      ),
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4',
      lg: 'h-12 px-6 text-lg',
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);

ThemedButton.displayName = 'ThemedButton';