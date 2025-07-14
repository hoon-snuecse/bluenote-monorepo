import { NextResponse } from 'next/server';

export async function GET() {
  const claudeApiKeySet = !!(
    process.env.CLAUDE_API_KEY && 
    process.env.CLAUDE_API_KEY !== 'YOUR_CLAUDE_API_KEY_HERE' &&
    process.env.CLAUDE_API_KEY.length > 0
  );

  return NextResponse.json({
    claudeApiKeySet,
    aiModel: claudeApiKeySet ? 'claude' : 'mock'
  });
}