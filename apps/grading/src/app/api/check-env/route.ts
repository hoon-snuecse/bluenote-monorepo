import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Anthropic API 키 상태 확인
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    let apiKeyStatus = 'not_configured';
    if (apiKey) {
      if (apiKey.startsWith('sk-ant-')) {
        apiKeyStatus = 'valid';
      } else {
        apiKeyStatus = 'invalid_format';
      }
    }
    
    return NextResponse.json({
      success: true,
      apiKeyStatus,
      // 보안상 실제 키는 노출하지 않음
      hasApiKey: !!apiKey
    });
  } catch (error) {
    console.error('환경 변수 확인 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '환경 변수 확인 중 오류가 발생했습니다.',
        apiKeyStatus: 'error'
      },
      { status: 500 }
    );
  }
}