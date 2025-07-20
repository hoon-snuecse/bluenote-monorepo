'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Check if we have a session from the main domain
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (!data.authenticated) {
          // Redirect to main site for authentication
          const returnUrl = encodeURIComponent(window.location.href);
          window.location.href = `https://bluenote.site/auth/signin?callbackUrl=${returnUrl}`;
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };

    checkSession();
  }, []);

  return null;
}