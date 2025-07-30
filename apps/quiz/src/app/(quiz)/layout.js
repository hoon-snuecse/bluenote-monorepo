import { TabNavigation } from '@/components/Navigation/TabNavigation'
import { getServerSession } from '@bluenote/auth'
import { redirect } from 'next/navigation'

export default async function QuizLayout({ children }) {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <TabNavigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}