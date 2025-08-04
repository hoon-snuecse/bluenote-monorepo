'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function DeviceInfoUpdater() {
  const { data: session, status } = useSession();
  
  useEffect(() => {
    // SessionProvider 내부에서만 작동
    
    console.log('DeviceInfoUpdater - status:', status, 'email:', session?.user?.email);
    
    // 로그인된 상태에서만 실행
    if (status === 'authenticated' && session?.user?.email) {
      // 세션 시작 시에만 한 번 업데이트
      const sessionKey = `device-info-updated-${session.user.email}`;
      const hasUpdated = sessionStorage.getItem(sessionKey);
      
      console.log('DeviceInfoUpdater - hasUpdated:', hasUpdated);
      
      if (!hasUpdated) {
        // 디바이스 정보 업데이트 API 호출
        fetch('/api/auth/device-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('Device info updated:', data.device, data.browser);
            sessionStorage.setItem(sessionKey, 'true');
          }
        })
        .catch(error => {
          console.error('Failed to update device info:', error);
        });
      }
    }
  }, [sessionData]);
  
  // 화면에 렌더링할 것이 없음
  return null;
}