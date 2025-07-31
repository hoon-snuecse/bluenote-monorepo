'use client'

import { TabNavigation } from '@/components/Navigation/TabNavigation'

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TabNavigation />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}