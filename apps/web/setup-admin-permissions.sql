-- hoon@snuecse.org 사용자에게 관리자 권한 부여
-- Supabase SQL Editor에서 이 스크립트를 실행하세요

-- 1. 기존 레코드가 있는지 확인
SELECT * FROM user_permissions WHERE email = 'hoon@snuecse.org';

-- 2. 레코드가 없으면 새로 생성, 있으면 업데이트
INSERT INTO user_permissions (email, role, can_write, claude_daily_limit, created_at, updated_at)
VALUES (
    'hoon@snuecse.org',
    'admin',
    true,
    100,  -- 일일 Claude 사용 제한
    NOW(),
    NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
    role = 'admin',
    can_write = true,
    claude_daily_limit = 100,
    updated_at = NOW();

-- 3. 결과 확인
SELECT * FROM user_permissions WHERE email = 'hoon@snuecse.org';

-- 4. 다른 관리자나 사용자를 추가하려면:
-- INSERT INTO user_permissions (email, role, can_write, claude_daily_limit, created_at, updated_at)
-- VALUES ('other@example.com', 'user', true, 50, NOW(), NOW());