'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function SimpleNav() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return (
      <nav className="bg-white border-b p-4">
        <div className="container mx-auto">
          <p>Loading...</p>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          BlueNote Atelier
        </Link>
        
        <div className="flex gap-4 items-center">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          
          {session ? (
            <>
              <Link href="/ai/chat" className="hover:text-blue-600">
                Claude Chat
              </Link>
              {session.user?.isAdmin && (
                <Link href="/admin/dashboard" className="hover:text-blue-600">
                  Admin
                </Link>
              )}
              <span>{session.user?.name || session.user?.email}</span>
              <Link href="/api/auth/signout?callbackUrl=/" className="hover:text-blue-600">
                Logout
              </Link>
            </>
          ) : (
            <Link href="/login" className="hover:text-blue-600">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}