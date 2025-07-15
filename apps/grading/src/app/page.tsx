import { redirect } from 'next/navigation';

export default function Home() {
  // 메인 페이지 접속 시 바로 과제 목록으로 리다이렉트
  redirect('/assignments');
}