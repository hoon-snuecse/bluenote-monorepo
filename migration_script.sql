-- 마이그레이션 스크립트: email을 Google OAuth ID로 변환
-- 주의: 실행 전 백업 필수\!

-- 1. 먼저 현재 사용자들의 email과 ID 매핑 확인
-- NextAuth를 통해 로그인한 사용자들의 정보가 필요합니다
-- 이 정보는 NextAuth 세션에서만 얻을 수 있으므로, 
-- 사용자가 다시 로그인할 때 수집해야 합니다.

-- 2. 임시 매핑 테이블 생성
CREATE TABLE IF NOT EXISTS user_id_mapping (
  email VARCHAR(255) PRIMARY KEY,
  google_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 매핑 데이터 수집 후 아래 업데이트 실행
-- UPDATE student_groups 
-- SET created_by = (SELECT google_id FROM user_id_mapping WHERE email = created_by)
-- WHERE created_by IN (SELECT email FROM user_id_mapping);

-- UPDATE evaluation_templates 
-- SET created_by = (SELECT google_id FROM user_id_mapping WHERE email = created_by)
-- WHERE created_by IN (SELECT email FROM user_id_mapping);

-- 4. 확인
-- SELECT * FROM student_groups WHERE created_by LIKE '%@%'; -- email 형태로 남은 것 확인
