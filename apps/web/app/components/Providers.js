'use client';

import { SupabaseAuthProvider } from './SupabaseAuthProvider';
// import { DeviceInfoUpdater } from '@/components/DeviceInfoUpdater';

export default function Providers({ children }) {
  // Web 앱을 Supabase Auth로 전환
  return (
    <SupabaseAuthProvider>
      {/* DeviceInfoUpdater 임시 비활성화 - useSession 에러 수정 필요 */}
      {/* <DeviceInfoUpdater /> */}
      {children}
    </SupabaseAuthProvider>
  );
}