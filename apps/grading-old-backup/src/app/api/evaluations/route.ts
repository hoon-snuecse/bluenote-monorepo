import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createEvaluator } from '@/lib/ai-evaluator';
import { sendEvaluationUpdate } from './stream/route';

// AI 평가 실행 및 저장
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      submissionId, 
      assignmentId, 
      content, 
      gradingCriteria, 
      evaluationDomains, 
      evaluationLevels,
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
    
    // AI 평가기 생성
    const evaluatorType = process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY !== 'YOUR_CLAUDE_API_KEY_HERE' ? 'claude' : 'mock';
    const evaluator = createEvaluator(
      evaluatorType as 'claude' | 'mock',
      apiKey,
      aiModel as 'claude-3-sonnet' | 'claude-3-opus',
      {
        title: assignment?.title,
        grade: assignment?.grade,
        writingType: assignment?.writingType,
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
    
    // 평가 결과 저장
    const evaluation = await prisma.evaluation.create({
      data: {
        submissionId,
        assignmentId,
        studentId: studentId || studentName, // studentId가 없으면 studentName 사용
        domainEvaluations: evaluationResult.domainEvaluations,
        overallLevel: evaluationResult.overallLevel,
        overallFeedback: evaluationResult.overallFeedback,
        improvementSuggestions: JSON.stringify(evaluationResult.improvementSuggestions || []),
        strengths: JSON.stringify(evaluationResult.strengths || []),
        evaluatedBy: aiModel
      }
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
    return NextResponse.json(
      { success: false, error: '평가 중 오류가 발생했습니다.' },
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
      improvementSuggestions: JSON.parse(evaluation.improvementSuggestions),
      strengths: JSON.parse(evaluation.strengths),
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