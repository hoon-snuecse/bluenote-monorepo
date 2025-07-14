import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsageStats } from '@/lib/usage';

export async function GET(request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get usage statistics
    const stats = await getUsageStats(7); // Last 7 days
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch statistics',
      details: error.message 
    }, { status: 500 });
  }
}