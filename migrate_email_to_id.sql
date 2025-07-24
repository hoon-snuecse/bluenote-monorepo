-- 데이터 마이그레이션: email을 Google OAuth ID로 변환
-- hoon@snuecse.org → 109415541976044110666

-- 백업을 위한 안전장치 (실행 전 반드시 확인\!)
BEGIN;

-- assignments 테이블
UPDATE assignments 
SET teacher_id = '109415541976044110666'
WHERE teacher_id = 'hoon@snuecse.org';

-- evaluation_templates 테이블  
UPDATE evaluation_templates
SET created_by = '109415541976044110666'
WHERE created_by = 'hoon@snuecse.org';

-- student_groups 테이블 (만약 있다면)
UPDATE student_groups
SET created_by = '109415541976044110666'
WHERE created_by = 'hoon@snuecse.org';

-- evaluations_batch_jobs 테이블 (만약 있다면)
UPDATE evaluations_batch_jobs
SET created_by = '109415541976044110666'
WHERE created_by = 'hoon@snuecse.org';

-- 변경 사항 확인
SELECT 'assignments updated' as status, COUNT(*) as count 
FROM assignments WHERE teacher_id = '109415541976044110666'
UNION ALL
SELECT 'templates updated', COUNT(*) 
FROM evaluation_templates WHERE created_by = '109415541976044110666';

-- 문제가 없으면 COMMIT, 문제가 있으면 ROLLBACK
-- COMMIT;
-- ROLLBACK;
