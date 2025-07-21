import { NextResponse } from 'next/server';

export async function GET() {
  const claudeApiKey = process.env.CLAUDE_API_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  
  console.log('환경변수 체크:', {
    CLAUDE_API_KEY_exists: !!claudeApiKey,
    CLAUDE_API_KEY_length: claudeApiKey?.length || 0,
    CLAUDE_API_KEY_prefix: claudeApiKey?.substring(0, 10) || 'undefined',
    ANTHROPIC_API_KEY_exists: !!anthropicApiKey,
    ANTHROPIC_API_KEY_length: anthropicApiKey?.length || 0,
    NODE_ENV: process.env.NODE_ENV,
    cwd: process.cwd(),
  });
  
  return NextResponse.json({
    claudeApiKey: {
      exists: !!claudeApiKey,
      length: claudeApiKey?.length || 0,
      prefix: claudeApiKey?.substring(0, 10) || 'undefined',
      isDefault: claudeApiKey === 'YOUR_CLAUDE_API_KEY_HERE',
    },
    anthropicApiKey: {
      exists: !!anthropicApiKey,
      length: anthropicApiKey?.length || 0,
      prefix: anthropicApiKey?.substring(0, 10) || 'undefined',
    },
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}