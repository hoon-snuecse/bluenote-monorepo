import AnalyticsPostClient from './AnalyticsPostClient';

export const dynamic = 'force-dynamic';

export default function PostPage({ params }) {
  return <AnalyticsPostClient params={params} />;
}