-- Quiz 앱 초기 데이터베이스 마이그레이션
-- 이 파일을 Supabase SQL Editor에서 실행하세요

-- RLS 설정 함수 (이메일 기반 접근 제어)
CREATE OR REPLACE FUNCTION set_current_user_email(email text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_email', email, true);
END;
$$ LANGUAGE plpgsql;

-- 퀴즈 메타데이터 테이블
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  topic VARCHAR(500) NOT NULL,
  description TEXT,
  total_questions INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 문항 테이블
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL CHECK (LENGTH(question_text) <= 95),
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('true_false', 'multiple_choice')),
  difficulty VARCHAR(10) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  time_limit INTEGER DEFAULT 20 CHECK (time_limit BETWEEN 10 AND 60),
  correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 1 AND 4),
  hint TEXT,
  explanation TEXT,
  metadata JSONB DEFAULT '{}',
  order_index INTEGER NOT NULL,
  is_selected BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 선택지 테이블
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  option_text VARCHAR(60) NOT NULL,
  option_order INTEGER NOT NULL CHECK (option_order BETWEEN 1 AND 4),
  is_correct BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 내보내기 이력
CREATE TABLE IF NOT EXISTS quiz_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  export_format VARCHAR(10) NOT NULL CHECK (export_format IN ('csv', 'xlsx', 'html')),
  export_type VARCHAR(20) DEFAULT 'kahoot_quiz' CHECK (export_type IN ('kahoot_quiz', 'teacher_guide')),
  selected_questions_count INTEGER NOT NULL,
  file_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 공유 퀴즈
CREATE TABLE IF NOT EXISTS shared_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  subject_category VARCHAR(100),
  grade_level VARCHAR(50),
  total_questions INTEGER NOT NULL,
  true_false_count INTEGER DEFAULT 0,
  multiple_choice_count INTEGER DEFAULT 0,
  kahoot_csv_url TEXT,
  kahoot_excel_url TEXT,
  guide_html_url TEXT,
  is_public BOOLEAN DEFAULT true,
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  rating_average DECIMAL(2,1) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 다운로드 이력
CREATE TABLE IF NOT EXISTS quiz_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_quiz_id UUID REFERENCES shared_quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('csv', 'xlsx', 'html')),
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 평가
CREATE TABLE IF NOT EXISTS quiz_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_quiz_id UUID REFERENCES shared_quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(shared_quiz_id, user_id)
);

-- 일일 통계 (기존 패턴 활용)
CREATE TABLE IF NOT EXISTS quiz_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  quiz_created_count INTEGER DEFAULT 0,
  quiz_downloaded_count INTEGER DEFAULT 0,
  quiz_shared_count INTEGER DEFAULT 0,
  active_users_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- 사용자별 일일 통계
CREATE TABLE IF NOT EXISTS quiz_user_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  quiz_created_count INTEGER DEFAULT 0,
  quiz_downloaded_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 인덱스 생성
CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX idx_quizzes_status ON quizzes(status);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_questions_order ON questions(quiz_id, order_index);
CREATE INDEX idx_question_options_question_id ON question_options(question_id);
CREATE INDEX idx_quiz_exports_user_id ON quiz_exports(user_id);
CREATE INDEX idx_shared_quizzes_user_id ON shared_quizzes(user_id);
CREATE INDEX idx_shared_quizzes_public ON shared_quizzes(is_public, visibility);
CREATE INDEX idx_shared_quizzes_category ON shared_quizzes(subject_category);
CREATE INDEX idx_shared_quizzes_downloads ON shared_quizzes(download_count DESC);
CREATE INDEX idx_shared_quizzes_rating ON shared_quizzes(rating_average DESC);
CREATE INDEX idx_shared_quizzes_created ON shared_quizzes(created_at DESC);
CREATE INDEX idx_quiz_downloads_shared_quiz ON quiz_downloads(shared_quiz_id);
CREATE INDEX idx_quiz_downloads_user ON quiz_downloads(user_id);
CREATE INDEX idx_quiz_ratings_shared_quiz ON quiz_ratings(shared_quiz_id);

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

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_quizzes_updated_at BEFORE UPDATE ON shared_quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 평점 평균 업데이트 트리거
CREATE OR REPLACE FUNCTION update_quiz_rating_average()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shared_quizzes
  SET rating_average = (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM quiz_ratings
    WHERE shared_quiz_id = NEW.shared_quiz_id
  ),
  rating_count = (
    SELECT COUNT(*)
    FROM quiz_ratings
    WHERE shared_quiz_id = NEW.shared_quiz_id
  )
  WHERE id = NEW.shared_quiz_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_average_after_insert
AFTER INSERT ON quiz_ratings
  FOR EACH ROW EXECUTE FUNCTION update_quiz_rating_average();

CREATE TRIGGER update_rating_average_after_update
AFTER UPDATE ON quiz_ratings
  FOR EACH ROW EXECUTE FUNCTION update_quiz_rating_average();

CREATE TRIGGER update_rating_average_after_delete
AFTER DELETE ON quiz_ratings
  FOR EACH ROW EXECUTE FUNCTION update_quiz_rating_average();