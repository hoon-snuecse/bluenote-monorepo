import { NextResponse } from 'next/server';
import { checkLMStudioStatus } from '@/lib/lm-studio-api';

export async function GET() {
  try {
    const status = await checkLMStudioStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('LM Studio 상태 확인 실패:', error);
    return NextResponse.json({ available: false }, { status: 200 });
  }
}