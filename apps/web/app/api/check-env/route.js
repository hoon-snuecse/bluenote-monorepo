import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  // 로그인한 사용자만 확인 가능
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
  
  return NextResponse.json({
    hasAdminEmails: !!process.env.ADMIN_EMAILS,
    adminEmailCount: adminEmails.length,
    includesHoon: adminEmails.includes('hoon@snuecse.org'),
    // 보안상 실제 이메일 목록은 노출하지 않음
  });
}