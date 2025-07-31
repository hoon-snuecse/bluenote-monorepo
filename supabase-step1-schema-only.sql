-- STEP 1: 스키마 업데이트만 수행 (RLS 정책 제외)

-- =====================================================
-- 1. Quiz 앱 테이블 스키마 업데이트
-- =====================================================

-- quizzes 테이블에 샘플 표시 컬럼 추가
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sample_order INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sample_category VARCHAR(50) DEFAULT NULL;

-- questions 테이블에도 샘플 표시 추가 (퀴즈와 연동)
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false;

-- shared_quizzes 테이블에 샘플 표시 컬럼 추가
ALTER TABLE public.shared_quizzes 
ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sample_order INTEGER DEFAULT NULL;

-- =====================================================
-- 2. 인덱스 추가 (성능 최적화)
-- =====================================================

-- 샘플 데이터 조회 성능 향상을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_quizzes_is_sample ON public.quizzes(is_sample);
CREATE INDEX IF NOT EXISTS idx_quizzes_sample_order ON public.quizzes(sample_order) WHERE is_sample = true;
CREATE INDEX IF NOT EXISTS idx_shared_quizzes_is_sample ON public.shared_quizzes(is_sample);

-- =====================================================
-- 3. 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '스키마 업데이트가 완료되었습니다. 이제 샘플 데이터를 삽입할 수 있습니다.';
END $$;