// 브라우저 콘솔에서 실행할 테스트 스크립트
// sociogram@gmail.com으로 로그인 후 실행

// 1. 현재 User-Agent 확인
console.log('Current User-Agent:', navigator.userAgent);

// 2. Device Info API 호출
fetch('/api/auth/device-info', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include'
})
.then(res => res.json())
.then(data => {
  console.log('Device Info API Response:', data);
})
.catch(err => {
  console.error('Device Info API Error:', err);
});

// 3. Analytics API 호출
fetch('/api/admin/analytics-optimized', {
  credentials: 'include'
})
.then(res => res.json())
.then(data => {
  const sociogram = data.stats?.userActivity?.find(u => u.email === 'sociogram@gmail.com');
  console.log('Analytics API - sociogram data:', sociogram);
})
.catch(err => {
  console.error('Analytics API Error:', err);
});

// 4. 강제 세션 클리어 후 재시도
console.log('Clearing session storage...');
Object.keys(sessionStorage).forEach(key => {
  if (key.includes('device-info')) {
    sessionStorage.removeItem(key);
  }
});

// 5. 다시 Device Info API 호출
setTimeout(() => {
  console.log('Retrying Device Info API...');
  fetch('/api/auth/device-info', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  })
  .then(res => res.json())
  .then(data => {
    console.log('Device Info API Response (after clear):', data);
  });
}, 1000);