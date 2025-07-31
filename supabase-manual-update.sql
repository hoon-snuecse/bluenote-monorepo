-- Supabase 대시보드에서 실행할 전체 스크립트

-- =====================================================
-- 1. 기존 RLS 정책 삭제 및 새 정책 생성
-- =====================================================

-- quizzes 테이블 정책 교체
DROP POLICY IF EXISTS "Users can view own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can create own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can delete own quizzes" ON public.quizzes;

-- 새로운 정책 생성 (user_email 기반 + 샘플 지원)
CREATE POLICY "Users can view own and sample quizzes" ON public.quizzes
    FOR SELECT
    TO authenticated
    USING (
        user_email = auth.jwt() ->> 'email'
        OR is_sample = true
    );

CREATE POLICY "Users can create own quizzes" ON public.quizzes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_email = auth.jwt() ->> 'email'
        AND (is_sample = false OR is_sample IS NULL)
    );

CREATE POLICY "Users can update own quizzes" ON public.quizzes
    FOR UPDATE
    TO authenticated
    USING (
        user_email = auth.jwt() ->> 'email'
        AND (is_sample = false OR is_sample IS NULL)
    )
    WITH CHECK (
        user_email = auth.jwt() ->> 'email'
        AND (is_sample = false OR is_sample IS NULL)
    );

CREATE POLICY "Users can delete own quizzes" ON public.quizzes
    FOR DELETE
    TO authenticated
    USING (
        user_email = auth.jwt() ->> 'email'
        AND (is_sample = false OR is_sample IS NULL)
    );

-- =====================================================
-- 2. 샘플 퀴즈 데이터 삽입
-- =====================================================

-- 샘플 퀴즈 1: 초등학교 과학
INSERT INTO public.quizzes (
    id,
    user_email,
    title,
    topic,
    description,
    total_questions,
    metadata,
    tags,
    is_public,
    status,
    is_sample,
    sample_order,
    sample_category,
    created_at,
    updated_at
) VALUES (
    'sample-quiz-elem-science-1',
    'sample@bluenote.site',
    '[샘플] 초등 과학 - 물의 순환',
    '물의 순환',
    '초등학교 4학년 과학 물의 순환 단원 복습 퀴즈',
    10,
    '{"grade": "elementary4", "subject": "science", "difficulty": "easy"}',
    ARRAY['초등학교', '과학', '물의순환', '4학년'],
    true,
    'published',
    true,
    1,
    '초등학교',
    NOW(),
    NOW()
);

-- 샘플 퀴즈 2: 중학교 역사
INSERT INTO public.quizzes (
    id,
    user_email,
    title,
    topic,
    description,
    total_questions,
    metadata,
    tags,
    is_public,
    status,
    is_sample,
    sample_order,
    sample_category,
    created_at,
    updated_at
) VALUES (
    'sample-quiz-middle-history-1',
    'sample@bluenote.site',
    '[샘플] 중학교 역사 - 삼국시대',
    '삼국시대',
    '중학교 2학년 역사 삼국시대 단원 핵심 내용 퀴즈',
    15,
    '{"grade": "middle2", "subject": "history", "difficulty": "medium"}',
    ARRAY['중학교', '역사', '삼국시대', '2학년'],
    true,
    'published',
    true,
    2,
    '중학교',
    NOW(),
    NOW()
);

-- 샘플 퀴즈 3: 고등학교 수학
INSERT INTO public.quizzes (
    id,
    user_email,
    title,
    topic,
    description,
    total_questions,
    metadata,
    tags,
    is_public,
    status,
    is_sample,
    sample_order,
    sample_category,
    created_at,
    updated_at
) VALUES (
    'sample-quiz-high-math-1',
    'sample@bluenote.site',
    '[샘플] 고등 수학 - 미적분 기초',
    '미적분',
    '고등학교 2학년 수학 미적분 기초 개념 확인 퀴즈',
    12,
    '{"grade": "high2", "subject": "math", "difficulty": "hard"}',
    ARRAY['고등학교', '수학', '미적분', '2학년'],
    true,
    'published',
    true,
    3,
    '고등학교',
    NOW(),
    NOW()
);

-- =====================================================
-- 3. 샘플 퀴즈의 문항 추가 (각 퀴즈당 몇 개씩만)
-- =====================================================

-- 초등 과학 퀴즈 문항
INSERT INTO public.questions (quiz_id, question_text, question_type, time_limit, points, order_index, explanation)
VALUES 
('sample-quiz-elem-science-1', '물이 증발하면 어떤 상태로 변할까요?', 'multiple_choice', 20, 1000, 0, '물이 증발하면 기체 상태인 수증기가 됩니다.'),
('sample-quiz-elem-science-1', '비가 내리는 것은 물의 순환 과정 중 어느 단계일까요?', 'multiple_choice', 20, 1000, 1, '비는 구름 속의 작은 물방울들이 모여 무거워져 떨어지는 강수 현상입니다.');

-- 중학교 역사 퀴즈 문항
INSERT INTO public.questions (quiz_id, question_text, question_type, time_limit, points, order_index, explanation)
VALUES 
('sample-quiz-middle-history-1', '삼국 중 가장 먼저 건국된 나라는?', 'multiple_choice', 30, 1000, 0, '고구려는 기원전 37년에 주몽이 건국한 나라로, 삼국 중 가장 먼저 세워졌습니다.'),
('sample-quiz-middle-history-1', '백제의 수도였던 곳이 아닌 것은?', 'multiple_choice', 30, 1000, 1, '백제의 수도는 한성(서울), 웅진(공주), 사비(부여)였습니다.');

-- 고등 수학 퀴즈 문항
INSERT INTO public.questions (quiz_id, question_text, question_type, time_limit, points, order_index, explanation)
VALUES 
('sample-quiz-high-math-1', '함수 f(x) = x²의 x=2에서의 미분계수는?', 'multiple_choice', 45, 1000, 0, 'f''(x) = 2x이므로, x=2일 때 f''(2) = 4입니다.'),
('sample-quiz-high-math-1', '적분 ∫2x dx의 결과는? (적분상수 C 제외)', 'multiple_choice', 45, 1000, 1, '2x의 부정적분은 x² 입니다.');

-- =====================================================
-- 4. 문항 선택지 추가
-- =====================================================

-- 각 문항에 대한 선택지는 question ID를 조회한 후 추가해야 합니다
-- 실제 운영 환경에서는 questions 테이블에 삽입 후 반환된 ID를 사용합니다

-- =====================================================
-- 5. 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '샘플 데이터 및 RLS 정책 업데이트가 완료되었습니다!';
    RAISE NOTICE '이제 Quiz 앱에서 샘플 퀴즈를 확인할 수 있습니다.';
END $$;