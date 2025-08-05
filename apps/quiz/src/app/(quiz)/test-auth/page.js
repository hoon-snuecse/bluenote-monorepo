'use client'

import { useState, useEffect } from 'react'
import { useSupabaseAuth, createClient } from '@bluenote/supabase-auth'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function TestAuthPage() {
  const { session, loading: authLoading } = useSupabaseAuth()
  const [tests, setTests] = useState({
    auth: { status: 'pending', message: '' },
    jwt: { status: 'pending', message: '' },
    rls: { status: 'pending', message: '' },
    create: { status: 'pending', message: '' },
    read: { status: 'pending', message: '' },
    update: { status: 'pending', message: '' },
    delete: { status: 'pending', message: '' }
  })

  useEffect(() => {
    if (!authLoading) {
      runTests()
    }
  }, [authLoading, session])

  const runTests = async () => {
    const supabase = createClient()

    // 1. Auth 테스트
    if (session) {
      setTests(prev => ({
        ...prev,
        auth: { status: 'success', message: `로그인됨: ${session.user.email}` }
      }))
    } else {
      setTests(prev => ({
        ...prev,
        auth: { status: 'error', message: '로그인되지 않음' }
      }))
      return
    }

    // 2. JWT 테스트
    try {
      const { data: jwtData, error: jwtError } = await supabase.rpc('get_jwt_claims')
      if (jwtError) throw jwtError
      
      setTests(prev => ({
        ...prev,
        jwt: { 
          status: 'success', 
          message: `JWT email: ${jwtData?.email || 'N/A'}, sub: ${jwtData?.sub || 'N/A'}` 
        }
      }))
    } catch (error) {
      setTests(prev => ({
        ...prev,
        jwt: { status: 'error', message: error.message }
      }))
    }

    // 3. RLS 정책 테스트 - 현재 사용자 확인
    try {
      const { data: rlsData, error: rlsError } = await supabase.rpc('test_rls_email')
      if (rlsError) throw rlsError
      
      setTests(prev => ({
        ...prev,
        rls: { 
          status: 'success', 
          message: `RLS email: ${rlsData || 'N/A'}` 
        }
      }))
    } catch (error) {
      setTests(prev => ({
        ...prev,
        rls: { status: 'error', message: error.message }
      }))
    }

    // 테스트용 퀴즈 ID
    const testQuizId = `test-${Date.now()}`

    // 4. CREATE 테스트
    try {
      const { data: createData, error: createError } = await supabase
        .from('quizzes')
        .insert({
          id: testQuizId,
          user_email: session.user.email,
          title: 'Auth 테스트 퀴즈',
          description: 'RLS 정책 테스트용',
          is_sample: false
        })
        .select()
        .single()

      if (createError) throw createError
      
      setTests(prev => ({
        ...prev,
        create: { status: 'success', message: '퀴즈 생성 성공' }
      }))
    } catch (error) {
      setTests(prev => ({
        ...prev,
        create: { status: 'error', message: error.message }
      }))
    }

    // 5. READ 테스트
    try {
      const { data: readData, error: readError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', testQuizId)
        .single()

      if (readError) throw readError
      
      setTests(prev => ({
        ...prev,
        read: { status: 'success', message: '퀴즈 읽기 성공' }
      }))
    } catch (error) {
      setTests(prev => ({
        ...prev,
        read: { status: 'error', message: error.message }
      }))
    }

    // 6. UPDATE 테스트
    try {
      const { data: updateData, error: updateError } = await supabase
        .from('quizzes')
        .update({ description: '업데이트된 설명' })
        .eq('id', testQuizId)
        .select()

      if (updateError) throw updateError
      
      setTests(prev => ({
        ...prev,
        update: { status: 'success', message: '퀴즈 업데이트 성공' }
      }))
    } catch (error) {
      setTests(prev => ({
        ...prev,
        update: { status: 'error', message: error.message }
      }))
    }

    // 7. DELETE 테스트
    try {
      const { error: deleteError } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', testQuizId)

      if (deleteError) throw deleteError
      
      setTests(prev => ({
        ...prev,
        delete: { status: 'success', message: '퀴즈 삭제 성공' }
      }))
    } catch (error) {
      setTests(prev => ({
        ...prev,
        delete: { status: 'error', message: error.message }
      }))
    }
  }

  const renderTestResult = (test, name) => {
    const statusIcon = {
      pending: <Loader2 className="w-5 h-5 animate-spin text-gray-400" />,
      success: <CheckCircle className="w-5 h-5 text-green-500" />,
      error: <XCircle className="w-5 h-5 text-red-500" />
    }

    const statusColor = {
      pending: 'text-gray-600',
      success: 'text-green-700',
      error: 'text-red-700'
    }

    return (
      <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow">
        {statusIcon[test.status]}
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{name}</h3>
          <p className={`text-sm ${statusColor[test.status]}`}>
            {test.message || '테스트 대기 중...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Supabase Auth & RLS 테스트</h1>
        <p className="mt-1 text-sm text-gray-600">
          인증 시스템과 Row Level Security 정책이 올바르게 작동하는지 확인합니다.
        </p>
      </div>

      {authLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">인증 정보 확인 중...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {renderTestResult(tests.auth, '1. 인증 상태')}
          {renderTestResult(tests.jwt, '2. JWT 토큰 확인')}
          {renderTestResult(tests.rls, '3. RLS 이메일 확인')}
          {renderTestResult(tests.create, '4. CREATE 권한 (퀴즈 생성)')}
          {renderTestResult(tests.read, '5. READ 권한 (퀴즈 읽기)')}
          {renderTestResult(tests.update, '6. UPDATE 권한 (퀴즈 수정)')}
          {renderTestResult(tests.delete, '7. DELETE 권한 (퀴즈 삭제)')}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">테스트 설명</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• JWT 토큰: Supabase Auth에서 생성된 JWT 토큰의 claims 확인</li>
          <li>• RLS 이메일: auth.jwt() -{'>>'} 'email' 함수가 올바른 이메일을 반환하는지 확인</li>
          <li>• CRUD 권한: RLS 정책에 따른 데이터베이스 작업 권한 확인</li>
        </ul>
      </div>

      {session && (
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">현재 세션 정보</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}