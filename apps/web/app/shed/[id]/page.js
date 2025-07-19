import ShedPostClient from './ShedPostClient';

export const dynamic = 'force-dynamic';

export default async function PostPage({ params }) {
  const resolvedParams = await params;
  return <ShedPostClient params={resolvedParams} />;
}