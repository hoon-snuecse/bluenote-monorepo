import { cookies } from 'next/headers';
import { createServerClient } from '@bluenote/supabase-auth/server';
import { getServerSession } from '@/lib/auth';

export default async function ServerDebugPage() {
  // Get all cookies
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  
  // Get Supabase session using our server client
  const supabase = createServerClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  // Get session through our auth helper
  const authSession = await getServerSession();
  
  // Filter Supabase related cookies
  const supabaseCookies = allCookies.filter(cookie => 
    cookie.name.includes('sb-') || cookie.name.includes('supabase')
  );

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Server-Side Auth Debug</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Raw Supabase Cookies:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(supabaseCookies, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Supabase Session:</h2>
          {error && (
            <p className="text-red-600 mb-2">Error: {error.message}</p>
          )}
          <pre className="text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Auth Helper Session (with permissions):</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(authSession, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Environment Check:</h2>
          <pre className="text-sm">
{`NODE_ENV: ${process.env.NODE_ENV}
VERCEL_ENV: ${process.env.VERCEL_ENV}
Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}
Supabase Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set'}`}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">All Cookies (for debugging):</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(allCookies.map(c => ({
              name: c.name,
              value: c.value.substring(0, 50) + '...',
              domain: c.domain,
              path: c.path,
              httpOnly: c.httpOnly,
              secure: c.secure,
              sameSite: c.sameSite
            })), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}