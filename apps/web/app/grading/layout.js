import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import NavigationWithAuth from '@/app/components/NavigationWithAuth';

export default async function GradingLayout({ children }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login?callbackUrl=/grading');
  }

  // Check if user is admin
  const isAdmin = session.user?.email === 'hsyang@snu.ac.kr';
  
  return (
    <>
      <NavigationWithAuth />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {children}
      </div>
    </>
  );
}