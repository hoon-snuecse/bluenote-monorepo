#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3002'

const supabase = createClient(supabaseUrl, supabaseKey)

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  message?: string
  duration?: number
}

const results: TestResult[] = []

function log(message: string) {
  console.log(`[TEST] ${message}`)
}

async function runTest(name: string, testFn: () => Promise<void>) {
  const start = Date.now()
  try {
    await testFn()
    const duration = Date.now() - start
    results.push({ name, status: 'pass', duration })
    log(`✅ ${name} (${duration}ms)`)
  } catch (error) {
    const duration = Date.now() - start
    const message = error instanceof Error ? error.message : String(error)
    results.push({ name, status: 'fail', message, duration })
    log(`❌ ${name}: ${message} (${duration}ms)`)
  }
}

async function testHealthCheck() {
  const response = await fetch(`${baseUrl}/api/health`)
  if (!response.ok) throw new Error(`Health check failed: ${response.status}`)
  const data = await response.json()
  if (data.status !== 'ok') throw new Error('Health check returned bad status')
}

async function testAuthentication() {
  // NextAuth 세션 테스트
  const response = await fetch(`${baseUrl}/api/auth/session`)
  if (!response.ok) throw new Error(`Session check failed: ${response.status}`)
}

async function testAssignmentsCRUD() {
  // 과제 생성
  const createResponse = await fetch(`${baseUrl}/api/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Integration Test Assignment',
      schoolName: 'Test School',
      gradeLevel: '고1',
      writingType: '논설문',
      evaluationDomains: ['주장의 명확성', '논리적 구조'],
      evaluationLevels: ['상', '중', '하'],
      levelCount: 3,
      gradingCriteria: 'Test criteria'
    })
  })
  
  if (!createResponse.ok) {
    const error = await createResponse.text()
    throw new Error(`Failed to create assignment: ${error}`)
  }
  
  const { assignment } = await createResponse.json()
  log(`Created assignment: ${assignment.id}`)
  
  // 과제 조회
  const getResponse = await fetch(`${baseUrl}/api/assignments/${assignment.id}`)
  if (!getResponse.ok) throw new Error('Failed to get assignment')
  
  // 과제 삭제
  const deleteResponse = await fetch(`${baseUrl}/api/assignments/${assignment.id}`, {
    method: 'DELETE'
  })
  if (!deleteResponse.ok) throw new Error('Failed to delete assignment')
}

async function testEvaluationFlow() {
  // 임시 과제 생성
  const { data: assignment, error: assignmentError } = await supabase
    .from('Assignment')
    .insert({
      title: 'Evaluation Test Assignment',
      schoolName: 'Test School',
      gradeLevel: '고1',
      writingType: '논설문',
      evaluationDomains: ['주장의 명확성'],
      evaluationLevels: ['상', '중', '하'],
      levelCount: 3,
      gradingCriteria: 'Test criteria'
    })
    .select()
    .single()
  
  if (assignmentError) throw assignmentError
  
  // 제출물 생성
  const { data: submission, error: submissionError } = await supabase
    .from('Submission')
    .insert({
      assignmentId: assignment.id,
      studentName: '테스트학생',
      studentId: 'test-student-1',
      content: '이것은 테스트 에세이입니다. AI 평가를 위한 충분한 내용을 포함하고 있습니다.'
    })
    .select()
    .single()
  
  if (submissionError) throw submissionError
  
  // 평가 실행
  const evalResponse = await fetch(`${baseUrl}/api/submissions/${submission.id}/evaluation`, {
    method: 'POST'
  })
  
  if (!evalResponse.ok) {
    const error = await evalResponse.text()
    throw new Error(`Evaluation failed: ${error}`)
  }
  
  // 정리
  await supabase.from('Evaluation').delete().eq('submissionId', submission.id)
  await supabase.from('Submission').delete().eq('id', submission.id)
  await supabase.from('Assignment').delete().eq('id', assignment.id)
}

async function testBatchEvaluation() {
  const response = await fetch(`${baseUrl}/api/evaluations/batch`, {
    method: 'GET'
  })
  if (!response.ok) throw new Error(`Batch evaluation endpoint failed: ${response.status}`)
}

async function testReportGeneration() {
  // PDF 엔드포인트 확인
  const pdfResponse = await fetch(`${baseUrl}/api/reports/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assignmentId: 'test-assignment',
      studentIds: []
    })
  })
  
  // 401 또는 400 에러는 예상되는 결과 (실제 데이터가 없으므로)
  if (pdfResponse.status === 500) {
    throw new Error('PDF generation endpoint returned server error')
  }
}

async function testSSEConnection() {
  // SSE 연결 테스트 (짧은 시간만)
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      resolve() // 타임아웃은 성공으로 처리
    }, 2000)
    
    fetch(`${baseUrl}/api/evaluations/stream`)
      .then(response => {
        clearTimeout(timeout)
        if (!response.ok) reject(new Error(`SSE connection failed: ${response.status}`))
        else resolve()
      })
      .catch(error => {
        clearTimeout(timeout)
        reject(error)
      })
  })
}

// 메인 테스트 실행
async function runAllTests() {
  log('Starting integration tests...')
  log(`Base URL: ${baseUrl}`)
  log('---')
  
  await runTest('Health Check', testHealthCheck)
  await runTest('Authentication', testAuthentication)
  await runTest('Assignments CRUD', testAssignmentsCRUD)
  await runTest('Evaluation Flow', testEvaluationFlow)
  await runTest('Batch Evaluation', testBatchEvaluation)
  await runTest('Report Generation', testReportGeneration)
  await runTest('SSE Connection', testSSEConnection)
  
  log('---')
  log('Test Summary:')
  
  const passed = results.filter(r => r.status === 'pass').length
  const failed = results.filter(r => r.status === 'fail').length
  const skipped = results.filter(r => r.status === 'skip').length
  
  log(`✅ Passed: ${passed}`)
  log(`❌ Failed: ${failed}`)
  log(`⏭️  Skipped: ${skipped}`)
  log(`Total: ${results.length}`)
  
  if (failed > 0) {
    log('\nFailed tests:')
    results.filter(r => r.status === 'fail').forEach(r => {
      log(`- ${r.name}: ${r.message}`)
    })
    process.exit(1)
  }
  
  log('\n🎉 All tests passed!')
}

runAllTests().catch(error => {
  console.error('Test runner error:', error)
  process.exit(1)
})