import ResearchPostClient from './ResearchPostClient';

export const dynamic = 'force-dynamic';

export default function ResearchPostPage({ params }) {
  return <ResearchPostClient params={params} />;
}