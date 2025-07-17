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
      studentName
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
    
    // AI 평가기 생성 - 평가 페이지에서 전달받은 assignment 정보 사용
    const evaluatorType = process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY !== 'YOUR_CLAUDE_API_KEY_HERE' ? 'claude' : 'mock';
    const evaluator = createEvaluator(
      evaluatorType as 'claude' | 'mock',
      apiKey,
      aiModel as 'claude-3-sonnet' | 'claude-3-opus',
      {
        title: title || assignment?.title,
        schoolName: schoolName || assignment?.schoolName,
        grade: gradeLevel || assignment?.gradeLevel,
        writingType: writingType || assignment?.writingType,
        studentName
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
        evaluatedBy: aiModel
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

    // JSON 문자열 파싱
    const formattedEvaluations = evaluations.map(evaluation => ({
      ...evaluation,
      improvementSuggestions: JSON.parse(evaluation.improvementSuggestions as string),
      strengths: JSON.parse(evaluation.strengths as string),
    }));

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