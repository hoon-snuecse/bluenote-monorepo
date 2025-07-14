'use client';

import * as React from 'react';
import { cn } from '../utils/cn';
import { useTheme } from '../theme/ThemeContext';

interface ThemedGradeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  grade: 'excellent' | 'good' | 'fair' | 'poor';
}

export function ThemedGradeCard({ 
  grade, 
  className, 
  children,
  ...props 
}: ThemedGradeCardProps) {
  const { theme } = useTheme();
  
  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-200',
        theme.effects.blur,
        theme.effects.shadow,
        theme.colors.grade[grade],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}