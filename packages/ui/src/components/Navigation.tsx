'use client';

import Link from 'next/link';
import { cn } from '../utils/cn';

export interface NavItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface NavigationProps {
  items: NavItem[];
  currentPath: string;
  className?: string;
}

export function NavigationMenu({ items, currentPath, className }: NavigationProps) {
  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  return (
    <nav className={cn('flex items-center gap-2', className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              isActive(item.href)
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}