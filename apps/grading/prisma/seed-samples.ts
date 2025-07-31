import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('샘플 과제 데이터 삽입 시작...')
  
  // 샘플 과제 1: 초등학교 독후감
  const assignment1 = await prisma.assignment.create({
    data: {
      userId: 'sample@bluenote.site',
      title: '[샘플] 초등학교 독후감 과제',
      instructions: `책을 읽고 느낀 점을 자유롭게 써보세요.

다음 내용을 포함해주세요:
1. 책 제목과 저자
2. 가장 인상 깊었던 장면
3. 책을 읽고 느낀 점
4. 친구들에게 추천하고 싶은 이유

분량: 200-300자`,
      type: 'essay',
      rubric: {
        criteria: [
          {
            name: '내용의 충실성',
            description: '제시된 항목들을 모두 포함했는가',
            maxScore: 40
          },
          {
            name: '창의성',
            description: '자신만의 생각과 느낌을 표현했는가',
            maxScore: 30
          },
          {
            name: '문장 구성',
            description: '문장이 자연스럽고 이해하기 쉬운가',
            maxScore: 30
          }
        ]
      },
      metadata: {
        grade: 'elementary',
        subject: 'korean',
        difficulty: 'easy'
      },
      maxScore: 100,
      isSample: true,
      sampleOrder: 1,
      sampleCategory: '초등학교'
    }
  })

  // 샘플 과제 2: 중학교 영어 에세이
  const assignment2 = await prisma.assignment.create({
    data: {
      userId: 'sample@bluenote.site',
      title: '[샘플] 중학교 영어 에세이',
      instructions: `Write about your favorite season in English.

Include the following:
1. Which season is your favorite and why
2. What activities you enjoy during this season
3. A memorable experience from this season
4. Why others might enjoy this season too

Length: 150-200 words`,
      type: 'essay',
      rubric: {
        criteria: [
          {
            name: 'Content & Ideas',
            description: 'Clear main idea with supporting details',
            maxScore: 30
          },
          {
            name: 'Grammar & Vocabulary',
            description: 'Correct grammar usage and appropriate vocabulary',
            maxScore: 30
          },
          {
            name: 'Organization',
            description: 'Logical flow and paragraph structure',
            maxScore: 20
          },
          {
            name: 'Creativity',
            description: 'Original ideas and engaging writing',
            maxScore: 20
          }
        ]
      },
      metadata: {
        grade: 'middle',
        subject: 'english',
        difficulty: 'medium'
      },
      maxScore: 100,
      isSample: true,
      sampleOrder: 2,
      sampleCategory: '중학교'
    }
  })

  // 샘플 과제 3: 고등학교 논술
  const assignment3 = await prisma.assignment.create({
    data: {
      userId: 'sample@bluenote.site',
      title: '[샘플] 고등학교 논술 - AI와 미래 사회',
      instructions: `"인공지능(AI) 기술의 발전이 우리 사회에 미치는 영향"에 대해 논하시오.

다음 관점들을 고려하여 작성하세요:
1. AI 기술이 가져올 긍정적 변화
2. AI 기술로 인한 우려사항과 해결방안
3. 미래 사회에서 인간의 역할
4. AI와 인간의 공존 방안

요구사항:
- 서론-본론-결론의 구조를 갖출 것
- 구체적인 예시를 2개 이상 포함할 것
- 자신의 견해를 명확히 제시할 것
- 분량: 800-1000자`,
      type: 'essay',
      rubric: {
        criteria: [
          {
            name: '논리성',
            description: '주장의 일관성과 논리적 전개',
            maxScore: 30
          },
          {
            name: '창의성',
            description: '독창적인 시각과 참신한 아이디어',
            maxScore: 25
          },
          {
            name: '구성력',
            description: '글의 구조와 단락 구성',
            maxScore: 20
          },
          {
            name: '표현력',
            description: '정확하고 효과적인 문장 표현',
            maxScore: 15
          },
          {
            name: '근거 제시',
            description: '구체적인 예시와 근거의 적절성',
            maxScore: 10
          }
        ]
      },
      metadata: {
        grade: 'high',
        subject: 'essay',
        difficulty: 'hard'
      },
      maxScore: 100,
      isSample: true,
      sampleOrder: 3,
      sampleCategory: '고등학교'
    }
  })

  console.log('샘플 과제 생성 완료:')
  console.log(`- ${assignment1.title}`)
  console.log(`- ${assignment2.title}`)
  console.log(`- ${assignment3.title}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('샘플 데이터 삽입 중 오류 발생:', e)
    await prisma.$disconnect()
    process.exit(1)
  })