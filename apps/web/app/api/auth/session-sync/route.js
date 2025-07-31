import { getServerSession } from '@bluenote/auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

// 임시 토큰 저장소 (프로덕션에서는 Redis 사용 권장)
const syncTokens = new Map();

// 토큰 정리 (5분 이상 된 토큰 삭제)
function cleanupTokens() {
  const now = Date.now();
  for (const [token, data] of syncTokens.entries()) {
    if (now - data.createdAt > 5 * 60 * 1000) {
      syncTokens.delete(token);
    }
  }
}

export async function POST(request) {
  try {
    // CORS 헤더 설정
    const origin = request.headers.get('origin');
    const headers = {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    };

    // 현재 세션 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401, headers }
      );
    }

    // 동기화 토큰 생성
    const tokenData = {
      email: session.user.email,
      userId: session.user.id,
      name: session.user.name,
      image: session.user.image,
      isAdmin: session.user.isAdmin,
      canWrite: session.user.canWrite,
      claudeDailyLimit: session.user.claudeDailyLimit,
      role: session.user.role
    };

    // 안전한 토큰 생성
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const token = Buffer.from(randomBytes).toString('hex');
    
    // 토큰 저장 (5분 유효)
    syncTokens.set(token, {
      ...tokenData,
      createdAt: Date.now()
    });

    // 오래된 토큰 정리
    cleanupTokens();

    console.log('[Session Sync] Token created for user:', session.user.email);

    return NextResponse.json({ 
      syncToken: token,
      expiresIn: 300 // 5분
    }, { headers });
  } catch (error) {
    console.error('[Session Sync] Error:', error);
    return NextResponse.json(
      { error: 'Internal error' }, 
      { status: 500, headers }
    );
  }
}

export async function GET(request) {
  try {
    // CORS 헤더 설정
    const origin = request.headers.get('origin');
    const headers = {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    };

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token required' }, 
        { status: 400, headers }
      );
    }

    // 토큰 확인
    const sessionData = syncTokens.get(token);
    if (!sessionData) {
      console.log('[Session Sync] Invalid or expired token');
      return NextResponse.json(
        { error: 'Invalid or expired token' }, 
        { status: 401, headers }
      );
    }

    // 토큰은 일회용이므로 삭제
    syncTokens.delete(token);

    // 세션 데이터 반환
    const { createdAt, ...userData } = sessionData;
    
    console.log('[Session Sync] Token validated for user:', userData.email);

    return NextResponse.json({
      user: userData,
      authenticated: true
    }, { headers });
  } catch (error) {
    console.error('[Session Sync] Error:', error);
    return NextResponse.json(
      { error: 'Internal error' }, 
      { status: 500, headers }
    );
  }
}

// OPTIONS 요청 처리 (CORS preflight)
export async function OPTIONS(request) {
  const origin = request.headers.get('origin');
  return new Response(null, {
    status: 204, // No Content status for OPTIONS
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}