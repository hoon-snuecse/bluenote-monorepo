'use client';

export default function NavigationWrapper() {
  // Temporarily disable Navigation to fix deployment
  return (
    <nav className="h-16 bg-white shadow-sm flex items-center px-4">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        <div className="font-bold text-xl">BlueNote Atelier</div>
        <div className="text-sm text-gray-600">Navigation temporarily disabled</div>
      </div>
    </nav>
  );
}