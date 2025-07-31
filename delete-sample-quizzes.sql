-- 샘플 퀴즈 삭제 SQL
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 삭제할 샘플 퀴즈 ID들
-- 5d1bf291-b399-4d70-8aef-507442f4409e - [샘플] 초등 과학 - 물의 순환
-- 76acab93-7514-4e0d-b10e-c8f415cab29e - [샘플] 중학교 역사 - 삼국시대
-- 547add44-dfa2-44a0-8e48-0115c2473a40 - [샘플] 고등 수학 - 미적분 기초

BEGIN;

-- 1. shared_quizzes 테이블에서 관련 레코드 확인 및 ID 가져오기
SELECT id, quiz_id FROM shared_quizzes 
WHERE quiz_id IN (
  '5d1bf291-b399-4d70-8aef-507442f4409e',
  '76acab93-7514-4e0d-b10e-c8f415cab29e',
  '547add44-dfa2-44a0-8e48-0115c2473a40'
);

-- 2. quiz_downloads 테이블에서 관련 다운로드 기록 삭제
DELETE FROM quiz_downloads
WHERE shared_quiz_id IN (
  SELECT id FROM shared_quizzes 
  WHERE quiz_id IN (
    '5d1bf291-b399-4d70-8aef-507442f4409e',
    '76acab93-7514-4e0d-b10e-c8f415cab29e',
    '547add44-dfa2-44a0-8e48-0115c2473a40'
  )
);

-- 3. quiz_ratings 테이블에서 관련 평점 기록 삭제
DELETE FROM quiz_ratings
WHERE shared_quiz_id IN (
  SELECT id FROM shared_quizzes 
  WHERE quiz_id IN (
    '5d1bf291-b399-4d70-8aef-507442f4409e',
    '76acab93-7514-4e0d-b10e-c8f415cab29e',
    '547add44-dfa2-44a0-8e48-0115c2473a40'
  )
);

-- 4. shared_quizzes 테이블에서 공유 정보 삭제
DELETE FROM shared_quizzes
WHERE quiz_id IN (
  '5d1bf291-b399-4d70-8aef-507442f4409e',
  '76acab93-7514-4e0d-b10e-c8f415cab29e',
  '547add44-dfa2-44a0-8e48-0115c2473a40'
);

-- 5. quiz_exports 테이블에서 내보내기 기록 삭제
DELETE FROM quiz_exports
WHERE quiz_id IN (
  '5d1bf291-b399-4d70-8aef-507442f4409e',
  '76acab93-7514-4e0d-b10e-c8f415cab29e',
  '547add44-dfa2-44a0-8e48-0115c2473a40'
);

-- 6. question_options 테이블에서 선택지 삭제
DELETE FROM question_options
WHERE question_id IN (
  SELECT id FROM questions 
  WHERE quiz_id IN (
    '5d1bf291-b399-4d70-8aef-507442f4409e',
    '76acab93-7514-4e0d-b10e-c8f415cab29e',
    '547add44-dfa2-44a0-8e48-0115c2473a40'
  )
);

-- 7. questions 테이블에서 문항 삭제
DELETE FROM questions
WHERE quiz_id IN (
  '5d1bf291-b399-4d70-8aef-507442f4409e',
  '76acab93-7514-4e0d-b10e-c8f415cab29e',
  '547add44-dfa2-44a0-8e48-0115c2473a40'
);

-- 8. 마지막으로 quizzes 테이블에서 샘플 퀴즈 삭제
DELETE FROM quizzes
WHERE is_sample = true
AND id IN (
  '5d1bf291-b399-4d70-8aef-507442f4409e',
  '76acab93-7514-4e0d-b10e-c8f415cab29e',
  '547add44-dfa2-44a0-8e48-0115c2473a40'
);

-- 삭제 결과 확인
SELECT COUNT(*) as remaining_sample_quizzes 
FROM quizzes 
WHERE is_sample = true;

COMMIT;

-- 트랜잭션이 성공하면 COMMIT이 실행되고,
-- 문제가 있으면 ROLLBACK을 실행하세요:
-- ROLLBACK;