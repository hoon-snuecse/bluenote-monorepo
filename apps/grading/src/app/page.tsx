import { redirect } from 'next/navigation';

export default function Home() {
  // 메인 페이지 접속 시 과제 관리 페이지로 리다이렉트
  redirect('/assignments');
}