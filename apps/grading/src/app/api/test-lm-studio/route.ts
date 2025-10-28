import { NextRequest, NextResponse } from 'next/server';
import { evaluateWithLMStudio, checkLMStudioStatus } from '@/lib/lm-studio-api';

export async function POST(request: NextRequest) {
  try {
    // LM Studio 상태 확인
    const status = await checkLMStudioStatus();
    if (!status.available) {
      return NextResponse.json({
        success: false,
        error: 'LM Studio 서버가 실행 중이지 않습니다. localhost:1234에서 서버를 시작해주세요.'
      });
    }

    const data = await request.json();
    const {
      studentText,
      studentName = '테스트 학생',
      assignmentTitle = '테스트 과제',
      schoolName = '테스트 학교',
      grade = '3학년',
      writingType = '생활문'
    } = data;

    // LM Studio로 평가
    const result = await evaluateWithLMStudio({
      assignmentTitle,
      schoolName,
      grade,
      writingType,
      evaluationDomains: ['내용', '구성', '표현', '맞춤법'],
      evaluationLevels: ['매우 우수', '우수', '보통', '미흡'],
      levelCount: 4,
      evaluationPrompt: `학생의 ${writingType}을 평가해주세요. 
        학년 수준에 맞는 평가를 해주시고, 
        구체적인 피드백을 제공해주세요.`,
      studentText,
      studentName,
      temperature: 0.3
    });

    return NextResponse.json({
      success: true,
      result,
      message: 'LM Studio 평가 완료'
    });

  } catch (error) {
    console.error('LM Studio 테스트 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '평가 중 오류 발생'
    }, { status: 500 });
  }
}