-- Supabase 대시보드에서 실행할 최종 스크립트
-- 현재 RLS 정책이 app.current_user_email 방식을 사용하므로 이에 맞춰 수정

-- =====================================================
-- 1. 기존 RLS 정책 삭제 및 새 정책 생성
-- =====================================================

-- quizzes 테이블 정책 교체
DROP POLICY IF EXISTS "Users can view own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can create own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can delete own quizzes" ON public.quizzes;

-- 새로운 정책 생성 (샘플 지원 추가)
CREATE POLICY "Users can view own and sample quizzes" ON public.quizzes
    FOR SELECT
    TO public
    USING (
        (user_email)::text = current_setting('app.current_user_email'::text, true)
        OR is_sample = true
    );

CREATE POLICY "Users can create own quizzes" ON public.quizzes
    FOR INSERT
    TO public
    WITH CHECK (
        (user_email)::text = current_setting('app.current_user_email'::text, true)
        AND (is_sample = false OR is_sample IS NULL)
    );

CREATE POLICY "Users can update own quizzes" ON public.quizzes
    FOR UPDATE
    TO public
    USING (
        (user_email)::text = current_setting('app.current_user_email'::text, true)
        AND (is_sample = false OR is_sample IS NULL)
    )
    WITH CHECK (
        (user_email)::text = current_setting('app.current_user_email'::text, true)
        AND (is_sample = false OR is_sample IS NULL)
    );

CREATE POLICY "Users can delete own quizzes" ON public.quizzes
    FOR DELETE
    TO public
    USING (
        (user_email)::text = current_setting('app.current_user_email'::text, true)
        AND (is_sample = false OR is_sample IS NULL)
    );

-- questions 테이블 정책 교체
DROP POLICY IF EXISTS "Users can access questions of own quizzes" ON public.questions;

CREATE POLICY "Users can view own and sample questions" ON public.questions
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q 
            WHERE q.id = questions.quiz_id 
            AND (
                (q.user_email)::text = current_setting('app.current_user_email'::text, true)
                OR q.is_sample = true
            )
        )
    );

CREATE POLICY "Users can insert own questions" ON public.questions
    FOR INSERT
    TO public
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quizzes q 
            WHERE q.id = questions.quiz_id 
            AND (q.user_email)::text = current_setting('app.current_user_email'::text, true)
            AND (q.is_sample = false OR q.is_sample IS NULL)
        )
    );

CREATE POLICY "Users can update own questions" ON public.questions
    FOR UPDATE
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q 
            WHERE q.id = questions.quiz_id 
            AND (q.user_email)::text = current_setting('app.current_user_email'::text, true)
            AND (q.is_sample = false OR q.is_sample IS NULL)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quizzes q 
            WHERE q.id = questions.quiz_id 
            AND (q.user_email)::text = current_setting('app.current_user_email'::text, true)
            AND (q.is_sample = false OR q.is_sample IS NULL)
        )
    );

CREATE POLICY "Users can delete own questions" ON public.questions
    FOR DELETE
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q 
            WHERE q.id = questions.quiz_id 
            AND (q.user_email)::text = current_setting('app.current_user_email'::text, true)
            AND (q.is_sample = false OR q.is_sample IS NULL)
        )
    );

-- question_options 테이블 정책 교체
DROP POLICY IF EXISTS "Users can access options of own questions" ON public.question_options;

CREATE POLICY "Users can view options for accessible questions" ON public.question_options
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.quizzes qz ON qz.id = q.quiz_id
            WHERE q.id = question_options.question_id
            AND (
                (qz.user_email)::text = current_setting('app.current_user_email'::text, true)
                OR qz.is_sample = true
            )
        )
    );

CREATE POLICY "Users can insert options for their questions" ON public.question_options
    FOR INSERT
    TO public
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.quizzes qz ON qz.id = q.quiz_id
            WHERE q.id = question_options.question_id
            AND (qz.user_email)::text = current_setting('app.current_user_email'::text, true)
            AND (qz.is_sample = false OR qz.is_sample IS NULL)
        )
    );

CREATE POLICY "Users can update options for their questions" ON public.question_options
    FOR UPDATE
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.quizzes qz ON qz.id = q.quiz_id
            WHERE q.id = question_options.question_id
            AND (qz.user_email)::text = current_setting('app.current_user_email'::text, true)
            AND (qz.is_sample = false OR qz.is_sample IS NULL)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.quizzes qz ON qz.id = q.quiz_id
            WHERE q.id = question_options.question_id
            AND (qz.user_email)::text = current_setting('app.current_user_email'::text, true)
            AND (qz.is_sample = false OR qz.is_sample IS NULL)
        )
    );

CREATE POLICY "Users can delete options for their questions" ON public.question_options
    FOR DELETE
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.quizzes qz ON qz.id = q.quiz_id
            WHERE q.id = question_options.question_id
            AND (qz.user_email)::text = current_setting('app.current_user_email'::text, true)
            AND (qz.is_sample = false OR qz.is_sample IS NULL)
        )
    );

-- shared_quizzes 테이블 정책 수정
DROP POLICY IF EXISTS "Users can view public shared quizzes" ON public.shared_quizzes;

CREATE POLICY "Anyone can view shared quizzes" ON public.shared_quizzes
    FOR SELECT
    TO public
    USING (true);

-- =====================================================
-- 2. 샘플 퀴즈 데이터 삽입 (UUID 자동 생성)
-- =====================================================

-- 샘플 퀴즈 1: 초등학교 과학
INSERT INTO public.quizzes (
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
    sample_category
) VALUES (
    'sample@bluenote.site',
    '[샘플] 초등 과학 - 물의 순환',
    '물의 순환',
    '초등학교 4학년 과학 물의 순환 단원 복습 퀴즈',
    10,
    '{"grade": "elementary4", "subject": "science", "difficulty": "easy"}'::jsonb,
    ARRAY['초등학교', '과학', '물의순환', '4학년'],
    true,
    'published',
    true,
    1,
    '초등학교'
);

-- 샘플 퀴즈 2: 중학교 역사
INSERT INTO public.quizzes (
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
    sample_category
) VALUES (
    'sample@bluenote.site',
    '[샘플] 중학교 역사 - 삼국시대',
    '삼국시대',
    '중학교 2학년 역사 삼국시대 단원 핵심 내용 퀴즈',
    15,
    '{"grade": "middle2", "subject": "history", "difficulty": "medium"}'::jsonb,
    ARRAY['중학교', '역사', '삼국시대', '2학년'],
    true,
    'published',
    true,
    2,
    '중학교'
);

-- 샘플 퀴즈 3: 고등학교 수학
INSERT INTO public.quizzes (
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
    sample_category
) VALUES (
    'sample@bluenote.site',
    '[샘플] 고등 수학 - 미적분 기초',
    '미적분',
    '고등학교 2학년 수학 미적분 기초 개념 확인 퀴즈',
    12,
    '{"grade": "high2", "subject": "math", "difficulty": "hard"}'::jsonb,
    ARRAY['고등학교', '수학', '미적분', '2학년'],
    true,
    'published',
    true,
    3,
    '고등학교'
);

-- =====================================================
-- 3. 샘플 퀴즈에 대한 문항 추가
-- =====================================================

-- 초등 과학 퀴즈의 문항 및 선택지 추가
WITH quiz1 AS (
    SELECT id FROM public.quizzes 
    WHERE title = '[샘플] 초등 과학 - 물의 순환' 
    AND is_sample = true 
    LIMIT 1
),
q1 AS (
    INSERT INTO public.questions (quiz_id, question_text, question_type, time_limit, points, order_index, explanation)
    SELECT 
        quiz1.id,
        '물이 증발하면 어떤 상태로 변할까요?',
        'multiple_choice',
        20,
        1000,
        0,
        '물이 증발하면 기체 상태인 수증기가 됩니다.'
    FROM quiz1
    RETURNING id
),
q2 AS (
    INSERT INTO public.questions (quiz_id, question_text, question_type, time_limit, points, order_index, explanation)
    SELECT 
        quiz1.id,
        '비가 내리는 것은 물의 순환 과정 중 어느 단계일까요?',
        'multiple_choice',
        20,
        1000,
        1,
        '비는 구름 속의 작은 물방울들이 모여 무거워져 떨어지는 강수 현상입니다.'
    FROM quiz1
    RETURNING id
),
-- 첫 번째 문항의 선택지
opt1 AS (
    INSERT INTO public.question_options (question_id, option_text, is_correct, order_index)
    SELECT id, '수증기', true, 0 FROM q1
    UNION ALL
    SELECT id, '얼음', false, 1 FROM q1
    UNION ALL
    SELECT id, '구름', false, 2 FROM q1
    UNION ALL
    SELECT id, '안개', false, 3 FROM q1
)
-- 두 번째 문항의 선택지
INSERT INTO public.question_options (question_id, option_text, is_correct, order_index)
SELECT id, '증발', false, 0 FROM q2
UNION ALL
SELECT id, '응결', false, 1 FROM q2
UNION ALL
SELECT id, '강수', true, 2 FROM q2
UNION ALL
SELECT id, '침투', false, 3 FROM q2;

-- 중학교 역사 퀴즈의 문항 및 선택지 추가
WITH quiz2 AS (
    SELECT id FROM public.quizzes 
    WHERE title = '[샘플] 중학교 역사 - 삼국시대' 
    AND is_sample = true 
    LIMIT 1
),
q3 AS (
    INSERT INTO public.questions (quiz_id, question_text, question_type, time_limit, points, order_index, explanation)
    SELECT 
        quiz2.id,
        '삼국 중 가장 먼저 건국된 나라는?',
        'multiple_choice',
        30,
        1000,
        0,
        '고구려는 기원전 37년에 주몽이 건국한 나라로, 삼국 중 가장 먼저 세워졌습니다.'
    FROM quiz2
    RETURNING id
),
q4 AS (
    INSERT INTO public.questions (quiz_id, question_text, question_type, time_limit, points, order_index, explanation)
    SELECT 
        quiz2.id,
        '백제를 건국한 인물은 누구인가요?',
        'multiple_choice',
        30,
        1000,
        1,
        '백제는 고구려에서 남하한 온조가 기원전 18년에 건국했습니다.'
    FROM quiz2
    RETURNING id
),
-- 세 번째 문항의 선택지
opt3 AS (
    INSERT INTO public.question_options (question_id, option_text, is_correct, order_index)
    SELECT id, '고구려', true, 0 FROM q3
    UNION ALL
    SELECT id, '백제', false, 1 FROM q3
    UNION ALL
    SELECT id, '신라', false, 2 FROM q3
    UNION ALL
    SELECT id, '가야', false, 3 FROM q3
)
-- 네 번째 문항의 선택지
INSERT INTO public.question_options (question_id, option_text, is_correct, order_index)
SELECT id, '주몽', false, 0 FROM q4
UNION ALL
SELECT id, '온조', true, 1 FROM q4
UNION ALL
SELECT id, '박혁거세', false, 2 FROM q4
UNION ALL
SELECT id, '김수로', false, 3 FROM q4;

-- 고등 수학 퀴즈의 문항 및 선택지 추가
WITH quiz3 AS (
    SELECT id FROM public.quizzes 
    WHERE title = '[샘플] 고등 수학 - 미적분 기초' 
    AND is_sample = true 
    LIMIT 1
),
q5 AS (
    INSERT INTO public.questions (quiz_id, question_text, question_type, time_limit, points, order_index, explanation)
    SELECT 
        quiz3.id,
        '함수 f(x) = x²의 x=2에서의 미분계수는?',
        'multiple_choice',
        45,
        1000,
        0,
        'f''(x) = 2x이므로, x=2일 때 f''(2) = 4입니다.'
    FROM quiz3
    RETURNING id
),
q6 AS (
    INSERT INTO public.questions (quiz_id, question_text, question_type, time_limit, points, order_index, explanation)
    SELECT 
        quiz3.id,
        '다음 중 미분가능하지 않은 함수는?',
        'multiple_choice',
        45,
        1000,
        1,
        '절댓값 함수 |x|는 x=0에서 미분가능하지 않습니다.'
    FROM quiz3
    RETURNING id
),
-- 다섯 번째 문항의 선택지
opt5 AS (
    INSERT INTO public.question_options (question_id, option_text, is_correct, order_index)
    SELECT id, '2', false, 0 FROM q5
    UNION ALL
    SELECT id, '4', true, 1 FROM q5
    UNION ALL
    SELECT id, '6', false, 2 FROM q5
    UNION ALL
    SELECT id, '8', false, 3 FROM q5
)
-- 여섯 번째 문항의 선택지
INSERT INTO public.question_options (question_id, option_text, is_correct, order_index)
SELECT id, 'f(x) = x²', false, 0 FROM q6
UNION ALL
SELECT id, 'f(x) = x³', false, 1 FROM q6
UNION ALL
SELECT id, 'f(x) = |x|', true, 2 FROM q6
UNION ALL
SELECT id, 'f(x) = sin(x)', false, 3 FROM q6;

-- =====================================================
-- 4. 완료 메시지
-- =====================================================
DO $$
DECLARE
    quiz_count INTEGER;
    question_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO quiz_count FROM public.quizzes WHERE is_sample = true;
    SELECT COUNT(*) INTO question_count 
    FROM public.questions q 
    JOIN public.quizzes qz ON q.quiz_id = qz.id 
    WHERE qz.is_sample = true;
    
    RAISE NOTICE '샘플 데이터 및 RLS 정책 업데이트가 완료되었습니다!';
    RAISE NOTICE '샘플 퀴즈 % 개, 샘플 문항 % 개가 추가되었습니다.', quiz_count, question_count;
    RAISE NOTICE '이제 Quiz 앱에서 샘플 퀴즈를 확인할 수 있습니다.';
END $$;