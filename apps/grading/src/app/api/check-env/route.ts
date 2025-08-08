import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Anthropic API 키 상태 확인
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    let apiKeyStatus = 'not_configured';
    let hasClaudeKey = false;
    let isDefaultKey = false;
    
    if (apiKey) {
      hasClaudeKey = true;
      if (apiKey === 'YOUR_ANTHROPIC_API_KEY_HERE' || apiKey === '') {
        isDefaultKey = true;
        apiKeyStatus = 'default_or_empty';
      } else if (apiKey.startsWith('sk-ant-')) {
        apiKeyStatus = 'valid';
        isDefaultKey = false;
      } else {
        apiKeyStatus = 'invalid_format';
      }
    }
    
    return NextResponse.json({
      success: true,
      apiKeyStatus: {
        status: apiKeyStatus,
        hasClaudeKey,
        isDefaultKey,
        hasApiKey: !!apiKey && apiKey !== ''
      }
    });
  } catch (error) {
    console.error('환경 변수 확인 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '환경 변수 확인 중 오류가 발생했습니다.',
        apiKeyStatus: {
          status: 'error',
          hasClaudeKey: false,
          isDefaultKey: false,
          hasApiKey: false
        }
      },
      { status: 500 }
    );
  }
}