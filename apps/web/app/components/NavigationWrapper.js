'use client';

import { useState, useEffect } from 'react';
import Navigation from './Navigation';

export default function NavigationWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render Navigation after client-side mount to avoid hydration issues
  if (!mounted) {
    return (
      <div className="h-16 bg-white shadow-sm">
        {/* Navigation placeholder during SSR/hydration */}
      </div>
    );
  }

  return <Navigation />;
}