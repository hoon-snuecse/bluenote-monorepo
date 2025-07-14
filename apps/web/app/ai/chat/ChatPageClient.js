import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with useSession
const ChatPageClient = dynamic(
  () => import('./ChatPageClient'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }
);

export default function ChatPage() {
  return <ChatPageClient />;
}