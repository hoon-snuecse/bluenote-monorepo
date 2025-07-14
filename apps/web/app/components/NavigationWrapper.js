'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const Navigation = dynamic(() => import('./Navigation'), {
  ssr: false,
  loading: () => (
    <div className="h-16 bg-white shadow-sm">
      {/* Navigation placeholder during loading */}
    </div>
  ),
});

// Error boundary wrapper
function NavigationWithErrorBoundary() {
  return (
    <Suspense fallback={<div className="h-16 bg-white shadow-sm" />}>
      <Navigation />
    </Suspense>
  );
}

export default NavigationWithErrorBoundary;