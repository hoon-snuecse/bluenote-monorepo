import TeachingPostClient from './TeachingPostClient';

export const dynamic = 'force-dynamic';

export default function PostPage({ params }) {
  return <TeachingPostClient params={params} />;
}