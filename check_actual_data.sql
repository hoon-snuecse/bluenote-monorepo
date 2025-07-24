-- StudentGroup 테이블에서 email 형태로 저장된 데이터 확인
SELECT 'StudentGroup with email' as description, COUNT(*) as count
FROM "StudentGroup"
WHERE "createdBy" LIKE '%@%';

-- hoon@snuecse.org의 데이터 확인
SELECT 'StudentGroup for hoon' as description, COUNT(*) as count
FROM "StudentGroup"
WHERE "createdBy" = 'hoon@snuecse.org';

-- 실제 데이터 샘플 확인 (개인정보 보호를 위해 일부만)
SELECT "id", "createdBy", "createdAt"
FROM "StudentGroup"
WHERE "createdBy" LIKE '%@%'
LIMIT 5;
