-- PostgREST 강제 재시작을 위한 스키마 알림
-- 이는 Supabase가 권한 변경사항을 즉시 반영하도록 합니다

-- 1. PostgREST에 스키마 재로드 신호 보내기
NOTIFY pgrst, 'reload schema';

-- 2. 추가로 설정 재로드 신호도 보내기
NOTIFY pgrst, 'reload config';

-- 3. 권한 캐시 새로고침을 위한 더미 권한 변경
-- 임시로 권한을 제거했다가 다시 부여
BEGIN;
  -- 권한 임시 제거
  REVOKE SELECT ON public.research_posts FROM service_role;
  REVOKE SELECT ON public.shed_posts FROM service_role;
  REVOKE SELECT ON public.teaching_posts FROM service_role;
  REVOKE SELECT ON public.analytics_posts FROM service_role;
  
  -- 즉시 다시 부여
  GRANT ALL ON public.research_posts TO service_role;
  GRANT ALL ON public.shed_posts TO service_role;
  GRANT ALL ON public.teaching_posts TO service_role;
  GRANT ALL ON public.analytics_posts TO service_role;
COMMIT;

-- 4. 다시 한번 알림
NOTIFY pgrst, 'reload schema';