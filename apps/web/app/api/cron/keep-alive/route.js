import { createClient } from '@supabase/supabase-js'

// Supabase 프로젝트 활성 상태 유지용 cron endpoint
// Vercel Cron에서 매일 호출되어 자동 일시 중지 방지

export async function GET(request) {
  // Vercel Cron 인증 확인 (선택적이지만 권장)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // CRON_SECRET이 설정되지 않은 경우 허용 (개발 환경 등)
    if (process.env.CRON_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // 간단한 쿼리 실행 - 시스템 시간 조회 (어떤 테이블도 필요 없음)
    const { data, error } = await supabase.rpc('now')

    if (error) {
      // now() 함수가 없을 수 있으므로 대체 쿼리
      const { error: fallbackError } = await supabase
        .from('_keep_alive_ping')
        .select('*')
        .limit(1)

      // 테이블이 없어도 쿼리 자체가 Supabase 활동으로 기록됨
      console.log('[keep-alive] Ping sent (fallback query)')
    } else {
      console.log('[keep-alive] Ping sent:', data)
    }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Supabase keep-alive ping successful'
    })
  } catch (err) {
    console.error('[keep-alive] Error:', err)
    return Response.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
