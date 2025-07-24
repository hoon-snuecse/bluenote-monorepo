-- StudentGroup 테이블 마이그레이션
-- hoon@snuecse.org → 109415541976044110666

-- 트랜잭션 시작
BEGIN;

-- 변경 전 상태 확인
SELECT 'Before migration' as status, COUNT(*) as count
FROM "StudentGroup"
WHERE "createdBy" = 'hoon@snuecse.org';

-- StudentGroup 테이블 업데이트
UPDATE "StudentGroup"
SET "createdBy" = '109415541976044110666'
WHERE "createdBy" = 'hoon@snuecse.org';

-- 변경 후 상태 확인
SELECT 'After migration' as status, COUNT(*) as count
FROM "StudentGroup"
WHERE "createdBy" = '109415541976044110666';

-- 더 이상 email 형태의 데이터가 없는지 확인
SELECT 'Remaining email data' as status, COUNT(*) as count
FROM "StudentGroup"
WHERE "createdBy" LIKE '%@%';

-- 문제가 없으면 COMMIT, 문제가 있으면 ROLLBACK
-- COMMIT;
-- ROLLBACK;
