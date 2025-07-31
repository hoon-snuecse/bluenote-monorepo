-- Grading 앱 샘플 데이터 추가 (Supabase SQL Editor에서 실행)

-- 1. Assignment 테이블에 샘플 필드 추가 (이미 있다면 무시됨)
ALTER TABLE public."Assignment" 
ADD COLUMN IF NOT EXISTS "isSample" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "sampleOrder" INTEGER,
ADD COLUMN IF NOT EXISTS "sampleCategory" TEXT;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS "Assignment_isSample_idx" ON public."Assignment"("isSample");

-- 2. userId 컬럼 추가 (필요한 경우)
ALTER TABLE public."Assignment"
ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- 3. 기존 샘플 데이터 삭제
DELETE FROM public."Assignment" WHERE "isSample" = true;

-- 4. 샘플 과제 추가
-- 샘플 1: 초등학교 독후감
INSERT INTO public."Assignment" (
    id,
    "userId",
    title,
    "schoolName",
    "gradeLevel",
    "writingType",
    "evaluationDomains",
    "evaluationLevels",
    "levelCount",
    "gradingCriteria",
    "isSample",
    "sampleOrder",
    "sampleCategory",
    "createdAt",
    "updatedAt"
) VALUES (
    'sample-elem-book-report',
    'sample@bluenote.site',
    '[샘플] 초등학교 독후감 과제',
    '샘플초등학교',
    '4학년',
    '독후감',
    '["내용의 충실성", "창의성", "문장 구성"]'::jsonb,
    '["매우 우수", "우수", "보통", "노력 필요"]'::jsonb,
    4,
    '책을 읽고 느낀 점을 자유롭게 표현하는 독후감 작성',
    true,
    1,
    '초등학교',
    NOW(),
    NOW()
);

-- 샘플 2: 중학교 영어 에세이
INSERT INTO public."Assignment" (
    id,
    "userId",
    title,
    "schoolName",
    "gradeLevel",
    "writingType",
    "evaluationDomains",
    "evaluationLevels",
    "levelCount",
    "gradingCriteria",
    "isSample",
    "sampleOrder",
    "sampleCategory",
    "createdAt",
    "updatedAt"
) VALUES (
    'sample-middle-english-essay',
    'sample@bluenote.site',
    '[샘플] 중학교 영어 에세이',
    '샘플중학교',
    '2학년',
    '영어 에세이',
    '["Content & Ideas", "Grammar & Vocabulary", "Organization", "Creativity"]'::jsonb,
    '["Excellent", "Good", "Fair", "Needs Improvement"]'::jsonb,
    4,
    'Write about your favorite season in English',
    true,
    2,
    '중학교',
    NOW(),
    NOW()
);

-- 샘플 3: 고등학교 논술
INSERT INTO public."Assignment" (
    id,
    "userId",
    title,
    "schoolName",
    "gradeLevel",
    "writingType",
    "evaluationDomains",
    "evaluationLevels",
    "levelCount",
    "gradingCriteria",
    "isSample",
    "sampleOrder",
    "sampleCategory",
    "createdAt",
    "updatedAt"
) VALUES (
    'sample-high-essay',
    'sample@bluenote.site',
    '[샘플] 고등학교 논술 - AI와 미래 사회',
    '샘플고등학교',
    '2학년',
    '논술',
    '["논리성", "창의성", "구성력", "표현력", "근거 제시"]'::jsonb,
    '["탁월", "우수", "보통", "미흡"]'::jsonb,
    4,
    '인공지능(AI) 기술의 발전이 우리 사회에 미치는 영향에 대해 논하시오',
    true,
    3,
    '고등학교',
    NOW(),
    NOW()
);

-- 5. 확인
SELECT id, title, "isSample", "sampleOrder", "sampleCategory" 
FROM public."Assignment" 
WHERE "isSample" = true 
ORDER BY "sampleOrder";