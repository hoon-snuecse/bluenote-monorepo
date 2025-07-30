export async function POST() {
  // Quiz 앱에서는 로그아웃을 처리하지 않고, 
  // 메인 사이트로 리다이렉트하도록 클라이언트에 응답
  return Response.json({ 
    redirect: 'https://bluenote.site/api/auth/signout' 
  });
}