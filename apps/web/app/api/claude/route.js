import Anthropic from '@anthropic-ai/sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkClaudeUsage, recordUsage } from '@/lib/usage';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ 
        error: '로그인이 필요합니다.',
        errorType: 'authentication' 
      }, { status: 401 });
    }

    // Check usage limit
    const usage = await checkClaudeUsage(session.user.email);
    if (usage.remaining <= 0) {
      return Response.json({ 
        error: `일일 사용 한도(${usage.limit}회)를 초과했습니다. 내일 다시 시도해주세요.`,
        errorType: 'usage_limit',
        usage: {
          used: usage.used,
          limit: usage.limit,
          remaining: 0
        }
      }, { status: 429 });
    }

    const { message, context, blogMode } = await request.json();

    // API 키 확인
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY가 설정되지 않았습니다.');
      return Response.json({ 
        error: 'API 키가 설정되지 않았습니다.' 
      }, { status: 500 });
    }

    if (!message) {
      return Response.json({ 
        error: '메시지를 입력해주세요.' 
      }, { status: 400 });
    }

    console.log('Claude API 호출 시작:', { 
      messageLength: message.length, 
      context,
      blogMode,
      maxTokens: blogMode ? (context === 'daily' ? 2000 : 32000) : 2000
    });

    // 컨텍스트에 따른 시스템 프롬프트 설정
    let systemPrompt = `당신은 교육을 전공하는 교사이며, 동시에 데이터 분석가입니다.
이론에 대한 탐색을 좋아하고, 이론과 동향, 쟁점 등에 대해 학습을 합니다.
연구자의 관점을 늘 갖추고 글을 쓰길 원합니다.
글의 길이는 [일상] 카테고리를 제외하고는 충분히 길고 상세하게 작성해도 좋습니다.`;

    if (context === 'research') {
      systemPrompt += `\n[연구] 카테고리: 학술적 관점에서 이론적 탐구와 실증적 분석을 수행합니다. 
충분한 깊이와 길이로 주제를 탐구하여 학술적 가치를 담아주세요.`;
    } else if (context === 'teaching') {
      systemPrompt += `\n[교육] 카테고리: 교수학습 방법과 교육 현장의 실천적 지식을 다룹니다.
구체적인 사례와 방법론을 상세히 설명하여 실용적 가치를 높여주세요.`;
    } else if (context === 'analytics') {
      systemPrompt += `\n[분석] 카테고리: 데이터 기반의 통찰과 분석 방법론을 탐구합니다.
분석 과정과 결과를 충분히 설명하고, 시각화나 표를 활용한 상세한 설명을 제공하세요.`;
    } else if (context === 'daily' || context === 'coffee') {
      systemPrompt += `\n[일상] 카테고리: 교육자이자 연구자의 일상적 성찰과 경험을 나눕니다.
수필 형식의 부드럽고 서정적인 문체로 작성하세요. 개인적 경험과 감정을 솔직하게 표현하며, 
독자와 공감할 수 있는 따뜻한 어조를 유지하세요. 일상의 작은 순간에서 발견한 교육적 통찰을 
자연스럽게 녹여내어 표현하세요.`;
    }

    // 블로그 모드일 때 추가 지시사항
    if (blogMode) {
      // 일상 카테고리는 수필 형식
      if (context === 'daily') {
        systemPrompt += `\n\n다음 마크다운 템플릿 형식으로 수필을 작성하세요:
---
title: "[주제에 맞는 서정적인 제목]"
category: daily
tags: [관련 태그들을 자동으로 생성]
summary: "핵심 내용을 감성적으로 한 줄 요약"
isAIGenerated: true
---

# [제목]

[도입부 - 일상의 한 장면이나 경험으로 시작]

[본문 - 개인적 경험과 성찰을 자연스럽게 풀어내며, 교육적 통찰을 부드럽게 연결]

[여러 단락으로 구성하되, 딱딱한 구조 없이 물 흐르듯 자연스럽게 전개]

[마무리 - 여운을 남기는 성찰이나 질문으로 마무리]

**작성 지침:**
- 수필의 자유로운 형식과 서정적 문체를 활용합니다
- 개인적 경험과 감정을 솔직하고 따뜻하게 표현합니다
- 2,000-3,000자 정도의 적당한 분량으로 작성합니다
- 독자와 공감할 수 있는 보편적 정서를 담습니다
- 교훈적이기보다는 성찰적인 톤을 유지합니다`;
      } else {
        // 연구, 교육, 분석 카테고리는 소논문 형식
        systemPrompt += `\n\n다음 마크다운 템플릿 형식으로 소논문을 작성하세요:
---
title: "[주제에 맞는 학술적 제목]"
category: ${context || 'general'}
tags: [관련 태그들을 자동으로 생성]
summary: "핵심 내용 한 줄 요약"
isAIGenerated: true
---

# 제목

## 1. 서론
[연구의 배경과 필요성, 연구 목적을 학술적으로 서술]

## 2. 이론적 배경
### 2.1 선행 연구 검토
[관련 이론과 선행 연구들을 체계적으로 정리]

### 2.2 핵심 개념 정의
[주요 개념들의 학술적 정의와 범위 설정]

## 3. 본론
### 3.1 [첫 번째 주요 논점]
[심층적 분석과 논의]

### 3.2 [두 번째 주요 논점]
[추가적인 분석과 논의]

### 3.3 [세 번째 주요 논점]
[종합적 검토와 해석]

## 4. 결론 및 제언
### 4.1 연구 결과 요약
### 4.2 시사점
### 4.3 후속 연구를 위한 제언

## 참고문헌
[APA 스타일로 작성된 참고문헌 목록]

**작성 지침:**
- 학술 논문의 형식과 문체를 엄격히 준수합니다
- 객관적이고 논리적인 서술을 유지합니다
- 각 섹션을 충분히 상세하게 작성합니다 (전체 10,000자 이상 목표)
- 가능한 한 전체 논문을 완성하되, 토큰 제한에 도달하면 자연스럽게 마무리합니다
- 중간에 멈추게 되면 마지막에 "[미완성 - 계속 작성 필요]" 표시를 남깁니다
- 이모지는 절대 사용하지 않습니다
- 학술적 근거와 논리적 연결성을 중시합니다
- 전문 용어는 처음 사용 시 정의를 명확히 합니다
- 단락 구성은 서론-본론-결론의 구조를 갖춥니다
- 각 문장과 단락은 완전한 형태로 작성하여 중간에 끊기지 않도록 합니다`;
      }
    }

    // Claude Sonnet 4의 실제 최대 토큰은 8192이므로 조정
    const maxTokens = blogMode 
      ? (context === 'daily' ? 2000 : 8192) // 소논문 모드는 모델의 최대치 사용
      : 2000;
    
    console.log('토큰 설정:', { requestedTokens: maxTokens, modelLimit: 8192 });
    
    // API 호출 시 추가 파라미터로 안정성 향상
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      temperature: 0.7, // 일관성 있는 응답을 위해 적절한 온도 설정
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    });

    console.log('Claude API 응답 성공');
    
    // 응답 텍스트 확인
    const responseText = response.content[0].text;
    const responseLength = responseText.length;
    
    console.log('응답 길이:', responseLength, '글자');
    
    // 글이 중간에 끊겼는지 확인
    const isIncomplete = responseText.includes('[미완성') || 
                        responseText.includes('[계속 작성 필요]') ||
                        (blogMode && context !== 'daily' && responseLength < 8000);
    
    // Record usage
    await recordUsage(session.user.email, 'claude_chat');
    
    // Get updated usage info
    const updatedUsage = await checkClaudeUsage(session.user.email);
    
    return Response.json({ 
      response: responseText,
      timestamp: new Date().toISOString(),
      context: context || 'general',
      isIncomplete: isIncomplete,
      responseLength: responseLength,
      usage: {
        used: updatedUsage.used,
        limit: updatedUsage.limit,
        remaining: updatedUsage.remaining
      }
    });

  } catch (error) {
    // 상세한 오류 로깅
    console.error('Claude API 오류 상세:', {
      name: error.name,
      message: error.message,
      status: error.status,
      type: error.type,
      headers: error.headers
    });

    // 구체적인 오류 처리
    if (error.status === 401) {
      return Response.json({ 
        error: 'API 키가 유효하지 않습니다. Anthropic Console에서 API 키를 확인해주세요.',
        errorType: 'authentication'
      }, { status: 401 });
    } else if (error.status === 429) {
      return Response.json({ 
        error: 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
        errorType: 'rate_limit'
      }, { status: 429 });
    } else if (error.status === 400) {
      return Response.json({ 
        error: `요청 형식이 잘못되었습니다: ${error.message}`,
        errorType: 'bad_request'
      }, { status: 400 });
    } else if (error.status === 500) {
      return Response.json({ 
        error: 'Anthropic 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        errorType: 'server_error'
      }, { status: 500 });
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return Response.json({ 
        error: '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.',
        errorType: 'network_error'
      }, { status: 503 });
    } else {
      return Response.json({ 
        error: `Claude API 오류: ${error.message || '알 수 없는 오류가 발생했습니다.'}`,
        errorType: 'unknown_error'
      }, { status: 500 });
    }
  }
}

// GET 요청 처리 (API 상태 및 사용량 확인용)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    const baseInfo = {
      status: 'ok',
      service: 'Claude AI Chat API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      hasApiKey: !!process.env.ANTHROPIC_API_KEY
    };
    
    // If user is authenticated, include usage info
    if (session) {
      const usage = await checkClaudeUsage(session.user.email);
      return Response.json({
        ...baseInfo,
        authenticated: true,
        usage: {
          used: usage.used,
          limit: usage.limit,
          remaining: usage.remaining
        }
      });
    }
    
    return Response.json({
      ...baseInfo,
      authenticated: false
    });
  } catch (error) {
    console.error('Error in GET /api/claude:', error);
    return Response.json({
      status: 'error',
      service: 'Claude AI Chat API',
      error: 'Failed to fetch status'
    }, { status: 500 });
  }
}