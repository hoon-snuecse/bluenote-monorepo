-- RLS 활성화
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_user_daily_stats ENABLE ROW LEVEL SECURITY;

-- RLS 헬퍼 함수 (이메일 기반 접근 제어)
CREATE OR REPLACE FUNCTION auth.user_id_from_email(user_email text)
RETURNS uuid AS $$
  SELECT id FROM auth.users WHERE email = user_email LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 퀴즈 접근 정책
CREATE POLICY "Users can view own quizzes" ON quizzes
  FOR SELECT USING (
    user_id = auth.user_id_from_email(current_setting('app.current_user_email', true))
  );

CREATE POLICY "Users can create own quizzes" ON quizzes
  FOR INSERT WITH CHECK (
    user_id = auth.user_id_from_email(current_setting('app.current_user_email', true))
  );

CREATE POLICY "Users can update own quizzes" ON quizzes
  FOR UPDATE USING (
    user_id = auth.user_id_from_email(current_setting('app.current_user_email', true))
  );

CREATE POLICY "Users can delete own quizzes" ON quizzes
  FOR DELETE USING (
    user_id = auth.user_id_from_email(current_setting('app.current_user_email', true))
  );

-- 문항 접근 정책
CREATE POLICY "Users can access questions of own quizzes" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = questions.quiz_id 
      AND quizzes.user_id = auth.user_id_from_email(current_setting('app.current_user_email', true))
    )
  );

-- 선택지 접근 정책
CREATE POLICY "Users can access options of own questions" ON question_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM questions 
      JOIN quizzes ON quizzes.id = questions.quiz_id
      WHERE questions.id = question_options.question_id 
      AND quizzes.user_id = auth.user_id_from_email(current_setting('app.current_user_email', true))
    )
  );

-- 내보내기 이력 정책
CREATE POLICY "Users can view own exports" ON quiz_exports
  FOR SELECT USING (
    user_id = auth.user_id_from_email(current_setting('app.current_user_email', true))
  );

CREATE POLICY "Users can record exports" ON quiz_exports
  FOR INSERT WITH CHECK (
    user_id = auth.user_id_from_email(current_setting('app.current_user_email', true))
  );

-- 공유 퀴즈 접근 정책
CREATE POLICY "Users can view public shared quizzes" ON shared_quizzes
  FOR SELECT USING (
    is_public = true OR 
    user_id = auth.user_id_from_email(current_setting('app.current_user_email', true))
  );

CREATE POLICY "Users can create own shared quizzes" ON shared_quizzes
  FOR INSERT WITH CHECK (
    user_id = auth.user_id_from_email(current_setting('app.current_user_email', true))
  );

CREATE POLICY "Users can update own shared quizzes" ON shared_quizzes
  FOR UPDATE USING (
    user_id = auth.user_id_from_email(current_setting('app.current_user_email', true))
  );

CREATE POLICY "Users can delete own shared quizzes" ON shared_quizzes
  FOR DELETE USING (
    user_id = auth.user_id_from_email(current_setting('app.current_user_email', true))
  );

-- 다운로드 이력 정책
CREATE POLICY "Users can view own downloads" ON quiz_downloads
  FOR SELECT USING (
    user_id = auth.user_id_from_email(current_setting('app.current_user_email', true))
  );

CREATE POLICY "Users can record downloads" ON quiz_downloads
  FOR INSERT WITH CHECK (
    user_id = auth.user_id_from_email(current_setting('app.current_user_email', true))
  );

-- 평가 정책
CREATE POLICY "Users can view all ratings" ON quiz_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can create own ratings" ON quiz_ratings
  FOR INSERT WITH CHECK (
    user_id = auth.user_id_from_email(current_setting('app.current_user_email', true))
  );

CREATE POLICY "Users can update own ratings" ON quiz_ratings
  FOR UPDATE USING (
    user_id = auth.user_id_from_email(current_setting('app.current_user_email', true))
  );

-- 통계 테이블 정책
CREATE POLICY "Allow read access to daily stats" ON quiz_daily_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can view own user stats" ON quiz_user_daily_stats
  FOR SELECT USING (
    user_id = auth.user_id_from_email(current_setting('app.current_user_email', true))
  );

-- RLS 설정 함수
CREATE OR REPLACE FUNCTION set_current_user_email(email text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_email', email, true);
END;
$$ LANGUAGE plpgsql;