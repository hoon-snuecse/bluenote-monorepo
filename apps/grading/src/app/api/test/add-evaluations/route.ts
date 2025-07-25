import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    console.log('Adding test evaluations...');

    // 기존 테스트 데이터 확인
    const existingAssignment = await prisma.assignment.findFirst({
      where: { title: '테스트 과제' }
    });

    let assignment;
    if (existingAssignment) {
      assignment = existingAssignment;
      console.log('Using existing assignment:', assignment.id);
    } else {
      // 테스트용 Assignment 생성
      assignment = await prisma.assignment.create({
        data: {
          title: '테스트 과제',
          schoolName: '테스트 학교',
          gradeLevel: '고등학교 1학년',
          writingType: '논설문',
          evaluationDomains: ['주장의 명확성', '근거의 타당성', '논리적 구조', '설득력 있는 표현'],
          evaluationLevels: ['매우 우수', '우수', '보통', '미흡'],
          levelCount: 4,
          gradingCriteria: '테스트용 평가 기준'
        }
      });
      console.log('Created assignment:', assignment.id);
    }

    // 테스트용 Submission 생성
    const submission = await prisma.submission.create({
      data: {
        assignmentId: assignment.id,
        studentName: `테스트학생_${Date.now()}`,
        studentId: `test_${Date.now()}`,
        content: '테스트 내용입니다.'
      }
    });

    // 랜덤하게 Sonnet 또는 Opus 선택
    const models = ['claude-sonnet-4-20250514', 'claude-opus-20250514'];
    const selectedModel = models[Math.floor(Math.random() * models.length)];

    // 테스트용 Evaluation 생성
    const evaluation = await prisma.evaluation.create({
      data: {
        submissionId: submission.id,
        assignmentId: assignment.id,
        studentId: submission.studentId,
        domainEvaluations: {
          '주장의 명확성': { level: '우수', score: 85, feedback: '주장이 명확합니다.' },
          '근거의 타당성': { level: '보통', score: 70, feedback: '근거가 적절합니다.' },
          '논리적 구조': { level: '우수', score: 80, feedback: '논리적입니다.' },
          '설득력 있는 표현': { level: '우수', score: 85, feedback: '설득력이 있습니다.' }
        },
        overallLevel: '우수',
        overallFeedback: '전반적으로 우수한 글입니다.',
        improvementSuggestions: ['더 다양한 근거 제시', '문장 구조 개선'],
        strengths: ['명확한 주장', '논리적 전개'],
        evaluatedBy: selectedModel
      }
    });

    // 통계 확인
    const totalEvaluations = await prisma.evaluation.count();
    const evaluationsByModel = await prisma.evaluation.groupBy({
      by: ['evaluatedBy'],
      _count: {
        _all: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Test evaluation added',
      evaluation: {
        id: evaluation.id,
        model: selectedModel,
        studentName: submission.studentName
      },
      stats: {
        total: totalEvaluations,
        byModel: evaluationsByModel
      }
    });
  } catch (error) {
    console.error('Error adding test evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to add test evaluation', details: error.message },
      { status: 500 }
    );
  }
}