import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createEvaluator } from '@/lib/ai-evaluator';
import { sendEvaluationUpdate } from './stream/route';

// AI 평가 실행 및 저장
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('평가 요청 데이터:', {
      submissionId: data.submissionId,
      assignmentId: data.assignmentId,
      hasContent: !!data.content,
      contentLength: data.content?.length,
      evaluationDomains: data.evaluationDomains,
      evaluationLevels: data.evaluationLevels,
      aiModel: data.aiModel
    });
    
    const { 
      submissionId, 
      assignmentId, 
      content, 
      gradingCriteria, 
      evaluationDomains, 
      evaluationLevels,
      levelCount,
      title,
      schoolName,
      gradeLevel,
      writingType,
      aiModel = 'claude-3-sonnet',
      studentId,
      studentName,
      temperature = 0.1
    } = data;
    
    // 설정에서 API 키 가져오기
    const settings = await prisma.systemSettings.findUnique({
      where: { key: 'apiKeys' }
    });
    
    let apiKey = process.env.CLAUDE_API_KEY;
    if (settings?.value && typeof settings.value === 'object' && 'claudeApiKey' in settings.value) {
      // 암호화된 API 키 복호화 로직 필요
      // 현재는 환경변수 사용
    }
    
    // 과제 정보 가져오기
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId }
    });
    
    // AI 평가기 생성 - Mock 모델을 명시적으로 선택한 경우만 Mock 사용
    const evaluatorType = aiModel === 'mock' ? 'mock' : 'claude';
    
    // Claude API 키가 없으면서 Mock을 선택하지 않은 경우 에러
    if (evaluatorType === 'claude' && (!process.env.CLAUDE_API_KEY || process.env.CLAUDE_API_KEY === 'YOUR_CLAUDE_API_KEY_HERE')) {
      console.error('Claude API 키가 설정되지 않았습니다.');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Claude API 키가 설정되지 않았습니다. Mock 평가기를 사용하거나 API 키를 설정해주세요.' 
        },
        { status: 500 }
      );
    }
    
    // 디버그 로그 추가
    console.log('=== 평가기 선택 정보 ===');
    console.log('요청된 AI 모델:', aiModel);
    console.log('선택된 평가기 타입:', evaluatorType);
    console.log('CLAUDE_API_KEY 존재:', !!process.env.CLAUDE_API_KEY);
    console.log('=====================');
    
    const evaluator = createEvaluator(
      evaluatorType as 'claude' | 'mock',
      apiKey,
      aiModel as 'claude-3-sonnet' | 'claude-3-opus',
      {
        title: title || assignment?.title,
        schoolName: schoolName || assignment?.schoolName,
        grade: gradeLevel || assignment?.gradeLevel,
        writingType: writingType || assignment?.writingType,
        studentName,
        temperature
      }
    );
    
    // 평가 시작 알림
    sendEvaluationUpdate(assignmentId, {
      type: 'evaluation_started',
      submissionId,
      studentName,
      timestamp: new Date().toISOString()
    });
    
    // AI 평가 수행
    const evaluationResult = await evaluator.evaluate(
      content,
      gradingCriteria,
      evaluationDomains,
      evaluationLevels
    );
    
    // 기존 평가 횟수 확인
    const existingEvaluations = await prisma.evaluation.count({
      where: { submissionId }
    });
    
    console.log(`평가 저장: 제출물 ${submissionId}의 ${existingEvaluations + 1}번째 평가`);
    
    // 평가 결과 저장 (재평가인 경우 기존 평가는 유지하고 새로운 평가 추가)
    const evaluation = await prisma.evaluation.create({
      data: {
        submissionId,
        assignmentId,
        studentId: studentId || studentName, // studentId가 없으면 studentName 사용
        domainEvaluations: evaluationResult.domainEvaluations,
        overallLevel: evaluationResult.overallLevel,
        overallFeedback: evaluationResult.overallFeedback,
        improvementSuggestions: evaluationResult.improvementSuggestions || [],
        strengths: evaluationResult.strengths || [],
        evaluatedBy: evaluatorType === 'mock' ? 'Mock 평가기' : (aiModel || 'claude')
      }
    });
    
    console.log('평가 저장 완료:', evaluation.id);
    
    // 제출물 상태 업데이트 (evaluatedAt 시간 설정)
    await prisma.submission.update({
      where: { id: submissionId },
      data: { evaluatedAt: new Date() }
    });
    
    // 평가 완료 알림
    sendEvaluationUpdate(assignmentId, {
      type: 'evaluation_completed',
      submissionId,
      studentName,
      evaluationId: evaluation.id,
      overallLevel: evaluationResult.overallLevel,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      success: true, 
      evaluationId: evaluation.id,
      evaluation: {
        ...evaluation,
        improvementSuggestions: evaluationResult.improvementSuggestions,
        strengths: evaluationResult.strengths
      },
      message: '평가가 완료되었습니다.'
    });
  } catch (error) {
    console.error('평가 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '평가 중 오류가 발생했습니다.';
    const errorDetails = error instanceof Error ? error.stack : '';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}

// 평가 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assignmentId = searchParams.get('assignmentId');
    const studentId = searchParams.get('studentId');
    const round = searchParams.get('round');

    const where: any = {};
    if (assignmentId) where.assignmentId = assignmentId;
    if (studentId) where.studentId = studentId;

    const evaluations = await prisma.evaluation.findMany({
      where,
      orderBy: {
        evaluatedAt: 'desc'
      },
      include: {
        submission: {
          select: {
            studentName: true,
            studentId: true,
            content: true,
            submittedAt: true
          }
        }
      }
    });

    // JSON 문자열 파싱 및 통계 계산
    const formattedEvaluations = evaluations.map(evaluation => {
      const domainEvaluations = typeof evaluation.domainEvaluations === 'string' 
        ? JSON.parse(evaluation.domainEvaluations) 
        : evaluation.domainEvaluations;
      
      // 각 도메인의 점수 계산
      const scores: any = {};
      let totalScore = 0;
      let domainCount = 0;

      if (domainEvaluations && typeof domainEvaluations === 'object') {
        Object.entries(domainEvaluations).forEach(([domain, evalData]: [string, any]) => {
          if (evalData && evalData.score !== undefined) {
            scores[domain] = evalData.score;
            totalScore += evalData.score;
            domainCount++;
          }
        });
      }

      const averageScore = domainCount > 0 ? Math.round(totalScore / domainCount) : 0;

      return {
        id: evaluation.id,
        studentId: evaluation.studentId,
        studentName: evaluation.submission?.studentName || evaluation.studentId,
        status: evaluation.evaluatedAt ? 'completed' : 'pending',
        averageScore,
        scores,
        level: evaluation.overallLevel,
        evaluatedAt: evaluation.evaluatedAt,
        domainEvaluations,
        overallFeedback: evaluation.overallFeedback,
        improvementSuggestions: typeof evaluation.improvementSuggestions === 'string'
          ? JSON.parse(evaluation.improvementSuggestions)
          : evaluation.improvementSuggestions,
        strengths: typeof evaluation.strengths === 'string'
          ? JSON.parse(evaluation.strengths)
          : evaluation.strengths,
      };
    });

    return NextResponse.json({ 
      success: true, 
      evaluations: formattedEvaluations 
    });
  } catch (error) {
    console.error('평가 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '평가 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}