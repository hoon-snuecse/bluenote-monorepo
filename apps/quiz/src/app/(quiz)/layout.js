import { TabNavigation } from '@/components/Navigation/TabNavigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function QuizLayout({ children }) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('QuizLayout - session:', {
      exists: !!session,
      email: session?.user?.email,
      id: session?.user?.id
    })
    
    if (!session) {
      console.log('QuizLayout - no session, redirecting to /auth/signin')
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
  } catch (error) {
    console.error('QuizLayout error:', error)
    redirect('/auth/signin')
  }
}