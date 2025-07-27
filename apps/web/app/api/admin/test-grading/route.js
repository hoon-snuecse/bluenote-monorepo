import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = {
      timestamp: new Date().toISOString()
    };

    // Grading API 테스트
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://grading.bluenote.site'
      : 'http://localhost:3002';

    // 1. /api/stats 테스트
    try {
      const statsRes = await fetch(`${baseUrl}/api/stats`, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json'
        }
      });

      results.stats = {
        url: `${baseUrl}/api/stats`,
        status: statsRes.status,
        statusText: statsRes.statusText,
        ok: statsRes.ok
      };

      if (statsRes.ok) {
        const data = await statsRes.json();
        results.stats.data = data;
      } else {
        results.stats.error = await statsRes.text();
      }
    } catch (error) {
      results.stats = { error: error.message };
    }

    // 2. /api/stats/user-evaluations 테스트
    try {
      const userStatsRes = await fetch(`${baseUrl}/api/stats/user-evaluations`, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json'
        }
      });

      results.userStats = {
        url: `${baseUrl}/api/stats/user-evaluations`,
        status: userStatsRes.status,
        statusText: userStatsRes.statusText,
        ok: userStatsRes.ok
      };

      if (userStatsRes.ok) {
        const data = await userStatsRes.json();
        results.userStats.data = data;
      } else {
        results.userStats.error = await userStatsRes.text();
      }
    } catch (error) {
      results.userStats = { error: error.message };
    }

    // 3. 기본 연결 테스트
    try {
      const baseRes = await fetch(baseUrl, {
        cache: 'no-store'
      });

      results.base = {
        url: baseUrl,
        status: baseRes.status,
        statusText: baseRes.statusText,
        ok: baseRes.ok
      };
    } catch (error) {
      results.base = { error: error.message };
    }

    return NextResponse.json(results);

  } catch (error) {
    return NextResponse.json({ 
      error: 'Test Grading API Error', 
      message: error.message 
    }, { status: 500 });
  }
}