import AdminAnalyticsClient2 from './AdminAnalyticsClient2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: '통계 및 분석 - 관리자',
  description: '사용자 활동 및 시스템 통계 분석'
};

export default function AdminAnalyticsPage() {
  return <AdminAnalyticsClient2 />;
}