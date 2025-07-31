-- 샘플 데이터 삽입 스크립트
-- 각 앱에 기본 샘플 데이터를 제공하여 사용자가 쉽게 시작할 수 있도록 지원

-- =====================================================
-- 1. Quiz 앱 샘플 데이터
-- =====================================================

-- 샘플 사용자 ID (시스템 샘플용)
DO $$
DECLARE
    sample_user_id UUID := '00000000-0000-0000-0000-000000000000';
    quiz_id_1 UUID;
    quiz_id_2 UUID;
    quiz_id_3 UUID;
BEGIN
    -- 샘플 퀴즈 1: 한국사 기초
    INSERT INTO public.quizzes (
        id, user_id, title, subject, topic, grade_level, 
        difficulty, question_count, time_per_question,
        is_sample, sample_order, created_at
    ) VALUES (
        gen_random_uuid(), 
        sample_user_id, 
        '한국사 기초 퀴즈 - 조선시대', 
        'history', 
        '조선시대 주요 사건', 
        'middle', 
        'medium', 
        10, 
        30,
        true, 
        1, 
        NOW()
    ) RETURNING id INTO quiz_id_1;

    -- 샘플 퀴즈 1의 문제들
    INSERT INTO public.questions (quiz_id, question_text, question_type, correct_answer, time_seconds, explanation, is_sample)
    VALUES 
        (quiz_id_1, '조선을 건국한 인물은 누구인가요?', 'multiple_choice', '이성계', 30, '이성계는 1392년 조선을 건국하고 태조가 되었습니다.', true),
        (quiz_id_1, '훈민정음을 창제한 왕은?', 'multiple_choice', '세종대왕', 30, '세종대왕은 1443년 훈민정음을 창제하여 1446년에 반포했습니다.', true),
        (quiz_id_1, '임진왜란이 일어난 연도는?', 'multiple_choice', '1592년', 30, '임진왜란은 1592년부터 1598년까지 일어난 전쟁입니다.', true);

    -- 샘플 퀴즈 2: 초등 수학
    INSERT INTO public.quizzes (
        id, user_id, title, subject, topic, grade_level, 
        difficulty, question_count, time_per_question,
        is_sample, sample_order, created_at
    ) VALUES (
        gen_random_uuid(), 
        sample_user_id, 
        '초등 수학 - 사칙연산', 
        'math', 
        '덧셈과 뺄셈', 
        'elementary', 
        'easy', 
        15, 
        20,
        true, 
        2, 
        NOW()
    ) RETURNING id INTO quiz_id_2;

    -- 샘플 퀴즈 2의 문제들
    INSERT INTO public.questions (quiz_id, question_text, question_type, correct_answer, time_seconds, explanation, is_sample)
    VALUES 
        (quiz_id_2, '25 + 17 = ?', 'multiple_choice', '42', 20, '25 + 17 = 42입니다. 십의 자리와 일의 자리를 각각 더하면 됩니다.', true),
        (quiz_id_2, '100 - 37 = ?', 'multiple_choice', '63', 20, '100에서 37을 빼면 63이 됩니다.', true),
        (quiz_id_2, '15 × 4 = ?', 'multiple_choice', '60', 20, '15를 4번 더하면 60이 됩니다.', true);

    -- 샘플 퀴즈 3: 영어 기초
    INSERT INTO public.quizzes (
        id, user_id, title, subject, topic, grade_level, 
        difficulty, question_count, time_per_question,
        is_sample, sample_order, created_at
    ) VALUES (
        gen_random_uuid(), 
        sample_user_id, 
        '영어 기초 단어', 
        'english', 
        '일상생활 영어', 
        'elementary', 
        'easy', 
        20, 
        15,
        true, 
        3, 
        NOW()
    ) RETURNING id INTO quiz_id_3;

    -- 샘플 퀴즈 3의 문제들
    INSERT INTO public.questions (quiz_id, question_text, question_type, correct_answer, time_seconds, explanation, is_sample)
    VALUES 
        (quiz_id_3, 'Apple의 뜻은?', 'multiple_choice', '사과', 15, 'Apple은 사과를 의미합니다.', true),
        (quiz_id_3, 'Thank you는 어떤 의미인가요?', 'multiple_choice', '감사합니다', 15, 'Thank you는 감사 인사를 표현할 때 사용합니다.', true),
        (quiz_id_3, 'Good morning의 뜻은?', 'multiple_choice', '좋은 아침', 15, 'Good morning은 아침 인사입니다.', true);

    -- 공유 퀴즈로도 등록
    INSERT INTO public.shared_quizzes (
        quiz_id, user_id, title, description, subject, grade_level,
        download_count, is_public, is_sample, sample_order
    ) VALUES 
        (quiz_id_1, sample_user_id, '한국사 기초 퀴즈 - 조선시대', 
         '조선시대 주요 사건과 인물에 대한 기초 퀴즈입니다. 중학생 수준에 적합합니다.', 
         'history', 'middle', 0, true, true, 1),
        (quiz_id_2, sample_user_id, '초등 수학 - 사칙연산', 
         '초등학생을 위한 기초 사칙연산 문제입니다. 덧셈, 뺄셈, 곱셈을 연습할 수 있습니다.', 
         'math', 'elementary', 0, true, true, 2),
        (quiz_id_3, sample_user_id, '영어 기초 단어', 
         '일상생활에서 자주 사용하는 영어 단어를 학습할 수 있는 퀴즈입니다.', 
         'english', 'elementary', 0, true, true, 3);

END $$;

-- =====================================================
-- 2. Grading 앱 샘플 데이터
-- =====================================================

DO $$
DECLARE
    sample_email VARCHAR := 'sample@bluenote.site';
    assignment_id_1 UUID;
    assignment_id_2 UUID;
    assignment_id_3 UUID;
BEGIN
    -- 샘플 과제 1: 초등학교
    INSERT INTO public."Assignment" (
        id, email, title, description, "targetGrade", "dueDate",
        "isSample", "sampleOrder", "sampleCategory", "createdAt"
    ) VALUES (
        gen_random_uuid(),
        sample_email, 
        '나의 꿈 (초등 4학년)', 
        '여러분의 장래희망에 대해 자유롭게 써보세요. 왜 그 꿈을 갖게 되었는지, 그 꿈을 이루기 위해 어떤 노력을 하고 있는지 구체적으로 작성해주세요.',
        '초등학교 4학년', 
        NOW() + INTERVAL '30 days', 
        true, 
        1, 
        '초등', 
        NOW()
    ) RETURNING id INTO assignment_id_1;

    -- 샘플 과제 2: 중학교
    INSERT INTO public."Assignment" (
        id, email, title, description, "targetGrade", "dueDate",
        "isSample", "sampleOrder", "sampleCategory", "createdAt"
    ) VALUES (
        gen_random_uuid(),
        sample_email, 
        '독후감 - 내가 읽은 책 (중등)', 
        '최근에 읽은 책 중 가장 인상 깊었던 책을 선택하여 독후감을 작성하세요. 줄거리 요약과 함께 자신의 생각과 느낌을 충분히 표현해주세요.',
        '중학교 2학년', 
        NOW() + INTERVAL '30 days', 
        true, 
        2, 
        '중등', 
        NOW()
    ) RETURNING id INTO assignment_id_2;

    -- 샘플 과제 3: 고등학교
    INSERT INTO public."Assignment" (
        id, email, title, description, "targetGrade", "dueDate",
        "isSample", "sampleOrder", "sampleCategory", "createdAt"
    ) VALUES (
        gen_random_uuid(),
        sample_email, 
        '논설문 - 인공지능 시대의 교육 (고등)', 
        'AI 기술이 급속도로 발전하는 현대 사회에서 교육은 어떻게 변화해야 할까요? 자신의 견해를 논리적으로 서술하세요.',
        '고등학교 1학년', 
        NOW() + INTERVAL '30 days', 
        true, 
        3, 
        '고등', 
        NOW()
    ) RETURNING id INTO assignment_id_3;

    -- 각 샘플 과제에 샘플 제출물 추가 (평가 예시용)
    INSERT INTO public."Submission" (
        "assignmentId", "studentName", "studentId", content, 
        "submittedAt", "isSample"
    ) VALUES 
        (assignment_id_1, '김민준', '2024001', '저의 꿈은 과학자입니다. 어릴 때부터 실험하는 것을 좋아했고...', NOW(), true),
        (assignment_id_1, '이서연', '2024002', '저는 선생님이 되고 싶습니다. 우리 담임선생님처럼...', NOW(), true),
        (assignment_id_2, '박준서', '2024101', '「어린 왕자」를 읽고 - 이 책은 어른들이 잊고 살아가는...', NOW(), true),
        (assignment_id_3, '최지우', '2024201', '인공지능 시대, 창의성 교육의 중요성 - 서론: AI 기술의 발전은...', NOW(), true);

    -- 샘플 평가 템플릿
    INSERT INTO public."EvaluationTemplate" (
        email, name, description, criteria,
        "isSample", "sampleOrder", "createdAt"
    ) VALUES 
        (sample_email, 
         '기본 평가 기준 (4개 영역)', 
         '일반적인 글쓰기 평가에 사용할 수 있는 기본 템플릿입니다. 주장의 명확성, 근거의 타당성, 논리적 구조, 설득력 있는 표현을 균등하게 평가합니다.',
         '{
            "clarity": {"weight": 25, "description": "주장의 명확성"},
            "evidence": {"weight": 25, "description": "근거의 타당성"},
            "structure": {"weight": 25, "description": "논리적 구조"},
            "expression": {"weight": 25, "description": "설득력 있는 표현"}
         }'::jsonb,
         true, 
         1, 
         NOW()),
        (sample_email, 
         '창의적 글쓰기 평가', 
         '창의적 글쓰기에 특화된 평가 템플릿입니다. 독창성과 표현력에 더 높은 비중을 둡니다.',
         '{
            "originality": {"weight": 35, "description": "독창성"},
            "expression": {"weight": 35, "description": "표현력"},
            "structure": {"weight": 20, "description": "구성"},
            "grammar": {"weight": 10, "description": "맞춤법과 문법"}
         }'::jsonb,
         true, 
         2, 
         NOW()),
        (sample_email, 
         '논술 평가 기준', 
         '논술문 평가에 적합한 템플릿입니다. 논리성과 근거 제시에 중점을 둡니다.',
         '{
            "thesis": {"weight": 30, "description": "논제 파악과 주장"},
            "logic": {"weight": 30, "description": "논리적 전개"},
            "evidence": {"weight": 25, "description": "근거와 예시"},
            "conclusion": {"weight": 15, "description": "결론"}
         }'::jsonb,
         true, 
         3, 
         NOW());

END $$;

-- =====================================================
-- 실행 방법:
-- 1. 먼저 supabase-rls-sample-support.sql을 실행하여 스키마를 업데이트하세요
-- 2. 그 다음 이 스크립트를 실행하여 샘플 데이터를 삽입하세요
-- 3. 샘플 데이터는 언제든지 다시 실행하여 초기화할 수 있습니다
-- =====================================================