import { getServerSession } from '@/lib/auth';

export default async function AuthTestPage() {
  const session = await getServerSession();
  
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Web App Auth Test</h1>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Session Status:</h2>
        {session ? (
          <div>
            <p className="text-green-600">✓ Authenticated</p>
            <p>Email: {session.user.email}</p>
            <p>User ID: {session.user.id}</p>
            {session.user.permissions && (
              <>
                <p>Role: {session.user.permissions.role}</p>
                <p>Can Write: {session.user.permissions.can_write ? 'Yes' : 'No'}</p>
              </>
            )}
          </div>
        ) : (
          <p className="text-red-600">✗ Not authenticated</p>
        )}
      </div>
      
      <div className="mt-4">
        {!session && (
          <a
            href="/auth/signin"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Sign In
          </a>
        )}
      </div>
    </div>
  );
}