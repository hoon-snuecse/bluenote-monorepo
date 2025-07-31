import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Google OAuth로 바로 리다이렉트
  redirect('/api/auth/signin?provider=google');
}