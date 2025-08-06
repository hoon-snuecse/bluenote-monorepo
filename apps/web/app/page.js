import { Suspense } from 'react';
import HomePageClient from './HomePageClient';

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <HomePageClient />
    </Suspense>
  );
}