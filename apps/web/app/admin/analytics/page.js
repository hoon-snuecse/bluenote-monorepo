import AdminAnalyticsOptimized from './AdminAnalyticsOptimized';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: '통계 및 분석 - 관리자',
  description: '사용자 활동 및 시스템 통계 분석'
};

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 pb-8">
        <AdminAnalyticsOptimized />
      </div>
    </div>
  );
}