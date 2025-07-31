import { redirect } from 'next/navigation';

export default function LoginPage() {
  // NextAuth 로그인 페이지로 리다이렉트
  redirect('/auth/signin');
}