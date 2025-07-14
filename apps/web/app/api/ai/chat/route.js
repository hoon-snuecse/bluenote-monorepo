import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, model } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    // Use provided model or default
    const selectedModel = model || 'claude-sonnet-4-20250514';

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ 
        error: 'Claude API key not configured',
        response: 'Claude API 키가 설정되지 않았습니다. 관리자에게 문의하세요.'
      }, { status: 500 });
    }

    try {
      // Call Claude API
      const completion = await anthropic.messages.create({
        model: selectedModel,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        system: '당신은 도움이 되고 친절한 AI 어시스턴트입니다. 한국어로 자연스럽게 대화하며, 사용자의 질문에 정확하고 유용한 답변을 제공합니다.'
      });

      const response = completion.content[0].text;
      return NextResponse.json({ response });
    } catch (apiError) {
      console.error('Claude API error:', apiError);
      return NextResponse.json({ 
        error: 'Failed to get response from Claude',
        response: 'Claude API 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}