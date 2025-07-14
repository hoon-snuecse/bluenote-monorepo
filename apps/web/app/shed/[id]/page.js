import ShedPostClient from './ShedPostClient';

export const dynamic = 'force-dynamic';

export default function PostPage({ params }) {
  return <ShedPostClient params={params} />;
}