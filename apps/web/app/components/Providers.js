'use client';

import { SessionProvider } from '@bluenote/auth';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}