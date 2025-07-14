import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Only allow admin users to see this debug info
    if (!session.user?.isAdmin) {
      return new Response('Admin access required', { status: 403 });
    }

    // Check environment variables (without exposing sensitive values)
    const envCheck = {
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
      ANTHROPIC_API_KEY_LENGTH: process.env.ANTHROPIC_API_KEY?.length || 0,
      ANTHROPIC_API_KEY_PREFIX: process.env.ANTHROPIC_API_KEY?.substring(0, 10) || 'NOT_SET',
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    };

    return Response.json({ 
      status: 'ok',
      environment: envCheck,
      session: {
        user: session.user?.email,
        isAdmin: session.user?.isAdmin
      }
    });
  } catch (error) {
    console.error('Debug env error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}