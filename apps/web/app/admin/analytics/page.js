import { createServerClient } from '@bluenote/supabase-auth/server';
import AdminAnalyticsClient from './AdminAnalyticsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: '통계 및 분석 - 관리자',
  description: '사용자 활동 및 시스템 통계 분석'
};

export default async function AdminAnalyticsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 pb-8">
          <div className="text-center py-8 text-white">인증이 필요합니다.</div>
        </div>
      </div>
    );
  }
  
  // 권한 확인
  const { data: permissions } = await supabase
    .from('user_permissions')
    .select('role')
    .eq('email', user.email)
    .single();
  
  const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
  const isAdmin = permissions?.role === 'admin' || adminEmails.includes(user.email);
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 pb-8">
          <div className="text-center py-8 text-white">관리자 권한이 필요합니다.</div>
        </div>
      </div>
    );
  }
  
  // Pass null as initialStats to let client fetch from API
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 pb-8">
        <AdminAnalyticsClient initialStats={null} />
      </div>
    </div>
  );
}