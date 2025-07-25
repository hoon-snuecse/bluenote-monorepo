import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestEvaluations() {
  try {
    console.log('Adding test evaluations...');

    // 테스트용 Assignment 생성
    const assignment = await prisma.assignment.create({
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

    // 테스트용 Submission 생성
    const submissions = await Promise.all([
      prisma.submission.create({
        data: {
          assignmentId: assignment.id,
          studentName: '김민수',
          studentId: 'student001',
          content: '테스트 내용 1'
        }
      }),
      prisma.submission.create({
        data: {
          assignmentId: assignment.id,
          studentName: '이영희',
          studentId: 'student002',
          content: '테스트 내용 2'
        }
      })
    ]);

    console.log('Created submissions:', submissions.map(s => s.id));

    // 테스트용 Evaluation 생성 (다양한 AI 모델)
    const evaluations = await Promise.all([
      // Sonnet 평가
      prisma.evaluation.create({
        data: {
          submissionId: submissions[0].id,
          assignmentId: assignment.id,
          studentId: 'student001',
          domainEvaluations: {
            '주장의 명확성': { level: '우수', score: 85, feedback: '주장이 명확합니다.' },
            '근거의 타당성': { level: '보통', score: 70, feedback: '근거가 적절합니다.' }
          },
          overallLevel: '우수',
          overallFeedback: '전반적으로 우수한 글입니다.',
          improvementSuggestions: ['더 다양한 근거 제시'],
          strengths: ['명확한 주장'],
          evaluatedBy: 'claude-sonnet-4-20250514'
        }
      }),
      // Opus 평가
      prisma.evaluation.create({
        data: {
          submissionId: submissions[1].id,
          assignmentId: assignment.id,
          studentId: 'student002',
          domainEvaluations: {
            '주장의 명확성': { level: '매우 우수', score: 95, feedback: '주장이 매우 명확합니다.' },
            '근거의 타당성': { level: '우수', score: 85, feedback: '근거가 타당합니다.' }
          },
          overallLevel: '매우 우수',
          overallFeedback: '매우 우수한 글입니다.',
          improvementSuggestions: ['문장 다듬기'],
          strengths: ['논리적 구조', '설득력'],
          evaluatedBy: 'claude-opus-20250514'
        }
      }),
      // 오늘 날짜 Sonnet 평가
      prisma.evaluation.create({
        data: {
          submissionId: submissions[0].id,
          assignmentId: assignment.id,
          studentId: 'student001',
          domainEvaluations: {
            '주장의 명확성': { level: '보통', score: 75, feedback: '개선이 필요합니다.' }
          },
          overallLevel: '보통',
          overallFeedback: '재평가 결과입니다.',
          improvementSuggestions: ['주장 보강'],
          strengths: ['시도는 좋음'],
          evaluatedBy: 'claude-sonnet-4-20250514',
          evaluatedAt: new Date() // 오늘 날짜
        }
      })
    ]);

    console.log('Created evaluations:', evaluations.map(e => e.id));
    console.log('Test data added successfully!');
    
    // 통계 확인
    const totalEvaluations = await prisma.evaluation.count();
    const evaluationsByModel = await prisma.evaluation.groupBy({
      by: ['evaluatedBy'],
      _count: {
        _all: true
      }
    });
    
    console.log('\n통계:');
    console.log('총 평가 수:', totalEvaluations);
    console.log('모델별 평가:', evaluationsByModel);

  } catch (error) {
    console.error('Error adding test evaluations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestEvaluations();