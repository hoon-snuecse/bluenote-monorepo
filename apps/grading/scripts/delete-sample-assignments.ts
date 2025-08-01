import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteSampleAssignments() {
  console.log('샘플 과제 삭제 작업 시작...')
  
  try {
    // 1. 먼저 샘플 과제 확인
    const sampleAssignments = await prisma.assignment.findMany({
      where: {
        isSample: true
      },
      include: {
        submissions: {
          include: {
            evaluations: true
          }
        }
      }
    })
    
    console.log(`발견된 샘플 과제: ${sampleAssignments.length}개`)
    
    for (const assignment of sampleAssignments) {
      console.log(`\n과제: ${assignment.title}`)
      console.log(`- ID: ${assignment.id}`)
      console.log(`- 제출물: ${assignment.submissions.length}개`)
      
      let totalEvaluations = 0
      assignment.submissions.forEach(sub => {
        totalEvaluations += sub.evaluations.length
      })
      console.log(`- 평가: ${totalEvaluations}개`)
    }
    
    // 2. 삭제 확인
    console.log('\n위 샘플 과제들을 삭제하시겠습니까? (y/N)')
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    const answer = await new Promise<string>((resolve) => {
      readline.question('', (answer) => {
        readline.close()
        resolve(answer)
      })
    })
    
    if (answer.toLowerCase() !== 'y') {
      console.log('삭제 작업이 취소되었습니다.')
      return
    }
    
    // 3. 샘플 과제 삭제 (cascade로 관련 데이터도 자동 삭제)
    const result = await prisma.assignment.deleteMany({
      where: {
        isSample: true
      }
    })
    
    console.log(`\n✅ ${result.count}개의 샘플 과제가 삭제되었습니다.`)
    
    // 4. 삭제 후 확인
    const remainingAssignments = await prisma.assignment.count({
      where: {
        isSample: true
      }
    })
    
    console.log(`남은 샘플 과제: ${remainingAssignments}개`)
    
  } catch (error) {
    console.error('샘플 과제 삭제 중 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
deleteSampleAssignments()