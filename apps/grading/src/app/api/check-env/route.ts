import { NextResponse } from 'next/server';

export async function GET() {
  const apiKeyStatus = {
    hasClaudeKey: !!process.env.CLAUDE_API_KEY,
    isDefaultKey: process.env.CLAUDE_API_KEY === 'YOUR_CLAUDE_API_KEY_HERE',
    keyLength: process.env.CLAUDE_API_KEY?.length || 0,
    keyPrefix: process.env.CLAUDE_API_KEY?.substring(0, 15) + '...' || 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
  };

  console.log('환경변수 체크:', apiKeyStatus);

  return NextResponse.json({
    success: true,
    apiKeyStatus,
    timestamp: new Date().toISOString()
  });
}