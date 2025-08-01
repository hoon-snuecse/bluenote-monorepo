import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// .env 파일 로드
dotenv.config()

const prisma = new PrismaClient()

async function backupAndDeleteSamples() {
  console.log('샘플 과제 백업 및 삭제 작업 시작...')
  
  try {
    // 1. 백업 디렉토리 생성
    const backupDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir)
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = path.join(backupDir, `sample-assignments-backup-${timestamp}.json`)
    
    // 2. 샘플 과제 데이터 조회
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
    
    // 3. 백업 파일 생성
    const backupData = {
      timestamp: new Date().toISOString(),
      assignmentCount: sampleAssignments.length,
      assignments: sampleAssignments
    }
    
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2))
    console.log(`✅ 백업 파일 생성: ${backupFile}`)
    
    // 4. 백업 데이터 요약
    console.log('\n백업된 데이터:')
    sampleAssignments.forEach(assignment => {
      console.log(`- ${assignment.title}: ${assignment.submissions.length}개 제출물`)
    })
    
    // 5. 삭제 진행
    console.log('\n백업이 완료되었습니다. 샘플 과제를 삭제하시겠습니까? (y/N)')
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
      console.log('삭제 작업이 취소되었습니다. 백업 파일은 유지됩니다.')
      return
    }
    
    // 6. 샘플 과제 삭제
    const deleteResult = await prisma.assignment.deleteMany({
      where: {
        isSample: true
      }
    })
    
    console.log(`\n✅ ${deleteResult.count}개의 샘플 과제가 삭제되었습니다.`)
    console.log(`백업 파일 위치: ${backupFile}`)
    
  } catch (error) {
    console.error('작업 중 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
backupAndDeleteSamples()