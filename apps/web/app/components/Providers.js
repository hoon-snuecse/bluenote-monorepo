'use client';

import { NextAuthProvider } from '@bluenote/auth';
import { DeviceInfoUpdater } from '@/components/DeviceInfoUpdater';

export default function Providers({ children }) {
  // Web 앱은 NextAuth를 사용하므로 NextAuthProvider 사용
  return (
    <NextAuthProvider>
      <DeviceInfoUpdater />
      {children}
    </NextAuthProvider>
  );
}