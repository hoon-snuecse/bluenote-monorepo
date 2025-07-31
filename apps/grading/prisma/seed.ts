import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample assignments...');

  const sampleAssignments = [
    {
      id: 'sample-elem-argument-1',
      title: '[샘플] 초등 4학년 논설문 - 환경보호',
      schoolName: '블루노트 초등학교',
      gradeLevel: '초등학교 4학년',
      writingType: '논설문',
      evaluationDomains: ['주장의 명확성', '근거의 타당성', '논리적 구조', '설득력 있는 표현'],
      evaluationLevels: ['매우 우수', '우수', '보통', '노력 필요'],
      levelCount: 4,
      gradingCriteria: '초등학생 수준에 적합한 환경보호 주제의 논설문 평가. 명확한 주장, 구체적인 예시, 논리적 전개를 중점적으로 평가합니다.',
      isSample: true,
      sampleOrder: 1,
      sampleCategory: '초등학교'
    },
    {
      id: 'sample-middle-literature-1',
      title: '[샘플] 중학교 2학년 문학 감상문 - 소설 독후감',
      schoolName: '블루노트 중학교',
      gradeLevel: '중학교 2학년',
      writingType: '감상문',
      evaluationDomains: ['작품 이해도', '개인적 해석', '문학적 표현', '비평적 사고'],
      evaluationLevels: ['탁월', '우수', '양호', '기본', '미흡'],
      levelCount: 5,
      gradingCriteria: '문학 작품에 대한 깊이 있는 이해와 개인적 해석, 창의적인 표현력을 평가합니다.',
      isSample: true,
      sampleOrder: 2,
      sampleCategory: '중학교'
    },
    {
      id: 'sample-high-research-1',
      title: '[샘플] 고등학교 1학년 탐구보고서 - 과학 실험',
      schoolName: '블루노트 고등학교',
      gradeLevel: '고등학교 1학년',
      writingType: '탐구보고서',
      evaluationDomains: ['연구 설계', '데이터 분석', '결과 해석', '학술적 글쓰기', '참고문헌 활용'],
      evaluationLevels: ['A', 'B', 'C', 'D', 'E', 'F'],
      levelCount: 6,
      gradingCriteria: '과학적 탐구 과정의 체계성, 데이터 분석의 정확성, 결론 도출의 논리성을 종합적으로 평가합니다.',
      isSample: true,
      sampleOrder: 3,
      sampleCategory: '고등학교'
    }
  ];

  for (const assignment of sampleAssignments) {
    try {
      const existing = await prisma.assignment.findUnique({
        where: { id: assignment.id }
      });

      if (!existing) {
        await prisma.assignment.create({
          data: assignment
        });
        console.log(`Created sample assignment: ${assignment.title}`);
      } else {
        console.log(`Sample assignment already exists: ${assignment.title}`);
      }
    } catch (error) {
      console.error(`Error creating sample assignment ${assignment.title}:`, error);
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });