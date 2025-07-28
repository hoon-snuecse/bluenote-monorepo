### 5.6 샘플 데이터 (공유 기능 포함)

```sql
-- 샘플 퀴즈 데이터 (NextAuth 세션 기반)
INSERT INTO quizzes (user_id, title, topic, description) VALUES
((SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)), '동물농장 이해도 퀴즈', '문학 작품 분석', 'AI가 생성한 동물농장 관련 퀴즈');

-- 샘플 문항 데이터 (4지선다형)
INSERT INTO questions (quiz_id, question_text, question_type, difficulty, correct_answer, explanation, time_limit, order_index) VALUES
((SELECT id FROM quizzes WHERE title = '동물농장 이해도 퀴즈'), '동물농장에서 처음 반란을 일으키게 된 직접적 계기는 무엇인가?', 'multiple_choice', 'medium', 1, '메이저 영감의 연설이 동물들에게 혁명의 필요성을 깨닫게 해주었습니다.', 30, 1);

-- 샘플 선택지 데이터 (4지선다형)
INSERT INTO question_options (question_id, option_text, option_order, is_correct) VALUES
((SELECT id FROM questions WHERE question_text LIKE '동물농장에서 처음%'), '메이저 영감의 연설', 1, true),
((SELECT id FROM questions WHERE question_text LIKE '동물농장에서 처음%'), '존스의 동물 학대', 2, false),
((SELECT id FROM questions WHERE question_text LIKE '동물농장에서 처음%'), '스노볼의 선동', 3, false),
((SELECT id FROM questions WHERE question_text LIKE '동물농장에서 처음%'), '나폴레옹의 명령', 4, false);

-- 샘플 공유 퀴즈 데이터
INSERT INTO shared_quizzes (
  quiz_id, user_id, title, description, subject_category, grade_level,
  total_questions, true_false_count, multiple_choice_count,
  kahoot_csv_url, kahoot_excel_url, guide_html_url,
  is_public, visibility
) VALUES (
  (SELECT id FROM quizzes WHERE title = '동물농장 이해도 퀴즈'),
  (SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)),
  '동물농장 완벽 이해 퀴즈',
  '조지 오웰의 동물농장 작품을 깊이 있게 이해할 수 있는 퀴즈입니다.',
  '문학',
  '중학교',
  10,
  5,
  5,
  'https://storage.supabase.co/quiz-files/animal-farm-quiz.csv',
  'https://storage.supabase.co/quiz-files/animal-farm-quiz.xlsx', 
  'https://storage.supabase.co/quiz-files/animal-farm-guide.html',
  true,
  'public'
);

-- 샘플 다운로드 이력
INSERT INTO quiz_downloads (shared_quiz_id, user_id, file_type) VALUES
((SELECT id FROM shared_quizzes WHERE title = '동물농장 완벽 이해 퀴즈'), (SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)), 'csv');

-- 샘플 평가 데이터
INSERT INTO quiz_ratings (shared_quiz_id, user_id, rating, comment) VALUES
((SELECT id FROM shared_quizzes WHERE title = '동물농장 완벽 이해 퀴즈'), (SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)), 5, '정말 유용한 퀴즈입니다. 학생들이 좋아했어요!');
```

### 5.7 Kahoot 내보내기 형식 매핑

#### **CSV 구조 (실제 파일 기반)**
```csv
Question,Answer 1,Answer 2,Answer 3,Answer 4,Time limit,Correct answer(s)
"동물농장에서 처음 반란을 일으키게 된 직접적 계기는 무엇인가?","메이저 영감의 연설","존스의 동물 학대","스노볼의 선동","나폴레옹의 명령","30","1"
"스퀄러는 나폴레옹의 명령을 정당화하기 위해 동물농장의 규칙을 수시로 변경했다.","참","거짓","","","20","1"
```

#### **문항 순서 정렬 규칙**
- **OX형 문항**이 먼저 나오고, 그 다음에 **4지선다형 문항**이 나옴
- 각 유형 내에서는 생성된 순서 또는 사용자 지정 순서 유지
- Kahoot에서 읽을 때 이 순서대로 표시됨

#### **문항 유형별 처리 방식**

**4지선다형**
- Answer 1, 2, 3, 4 모두 채움
- Correct answer(s): 1, 2, 3, 4 중 정답 번호
- Time limit: 기본 30초 (10-60초 범위)

**OX형 (True/False)**
- Answer 1: "참", Answer 2: "거짓"  
- Answer 3, 4: 빈 문자열 ("")
- Correct answer(s): 1(참) 또는 2(거짓)
- Time limit: 기본 20초 (10-60초 범위)# Quiz 앱 개발 계획서

## 1. 프로젝트 개요

### 1.1 앱 이름
- **한글명**: Kahoot 퀴즈 메이커
- **영문명**: Kahoot Quiz Maker
- **내부명**: quiz-app

### 1.2 앱 목적
교사가 AI의 도움을 받아 Kahoot 퀴즈 템플릿을 쉽게 만들고, **교사 커뮤니티에서 공유**할 수 있는 플랫폼

### 1.3 주요 특징
- **개인 퀴즈 생성**: AI 기반 맞춤형 퀴즈 제작
- **커뮤니티 공유**: 제작한 퀴즈를 다른 교사들과 공유
- **자료 재활용**: 다른 교사가 만든 우수 퀴즈 다운로드 및 활용
- **통합 워크플로우**: 생성 → 내보내기 → 공유를 한 화면에서 처리

### 1.3 타겟 사용자
- **주 사용자**: 초중고 교사 및 교육연구자
- **최종 사용자**: 학생 및 학습자

### 1.4 서비스 도메인
- **프로덕션**: https://quiz.bluenote.site
- **스테이징**: https://staging-quiz.bluenote.site (선택사항)
- **개발**: http://localhost:3003

## 2. 기술 스택

### 2.1 프론트엔드
```json
{
  "framework": "Next.js 15.3.5 (App Router)",
  "runtime": "React 19 with JavaScript", 
  "styling": "Tailwind CSS v3 (@bluenote/config 상속)",
  "ui-components": "@bluenote/ui (공통 컴포넌트)",
  "fonts": "Geist Sans, Geist Mono, Noto Sans KR",
  "icons": "Lucide React",
  "charts": "Recharts",
  "animations": "Framer Motion"
}
```

### 2.2 백엔드 및 데이터베이스
```json
{
  "database": "Supabase (PostgreSQL)",
  "authentication": "@bluenote/auth (NextAuth + Google OAuth)",
  "realtime": "Supabase Realtime",
  "storage": "Supabase Storage",
  "ai-integration": "Claude API (Anthropic)",
  "session-management": "NextAuth Session (JWT)"
}
```

### 2.3 개발 도구
```json
{
  "package-manager": "pnpm (workspace protocol)",
  "build-tool": "Turborepo",
  "linting": "@bluenote/config/eslint",
  "formatting": "Prettier",
  "typescript-config": "@bluenote/config/tsconfig (JavaScript 프로젝트용)",
  "tailwind-config": "@bluenote/config/tailwind"
}
```

## 3. 주요 기능

### 3.1 핵심 기능
1. **AI 기반 퀴즈 생성**: Claude AI를 통한 주제별 맞춤 문항 생성 (정답 + 해설 포함)
2. **3단계 워크플로우**: 생성 → 검토/수정 → 내보내기 → **공유 저장**
3. **2가지 내보내기 형식**: 
   - **Kahoot 퀴즈 파일** (CSV, Excel)
   - **교사용 해설지** (HTML)
4. **커뮤니티 공유**: 제작한 퀴즈를 교사 커뮤니티에 공유
5. **자료 재활용**: 다른 교사의 퀴즈 다운로드 및 활용

### 3.2 탭 기반 통합 인터페이스

#### **3개 주요 탭 구조**
1. **📝 퀴즈 생성** (Create Quiz)
   - 주제 입력 및 AI 문항 생성
   - 문항 미리보기 및 선택
   - 내보내기 및 저장

2. **💾 내 퀴즈** (My Quizzes)  
   - 내가 생성한 퀴즈 목록
   - 수정, 재다운로드, 공유 설정

3. **🌍 커뮤니티** (Community)
   - 다른 교사들이 공유한 퀴즈 목록
   - 검색, 필터링, 다운로드

### 3.3 새로운 HTML/PDF 내보내기 기능

#### **3가지 내보내기 유형**
1. **문항만** (Questions Only)
   - **문항 내용, 선택지** 포함
   - Kahoot 업로드용 CSV/XLSX
   - 학생용 시험지 HTML/PDF (정답 숨김)

2. **정답 포함** (With Answers)  
   - **문항 내용, 선택지, 정답** 포함
   - 교사용 답안지
   - 채점용 자료

3. **정답+해설** (Answer Sheet)
   - **문항 내용, 선택지, 정답, 해설** 모두 포함
   - 학습용 자료
   - 복습용 해설집
   - 인쇄용 PDF (A4 최적화)

#### **HTML 해설지 내용 구성**
```html
<!DOCTYPE html>
<html>
<head>
    <title>퀴즈 해설지 - [주제명]</title>
    <style>
        /* 인쇄 친화적 스타일링 */
        body { font-family: 'Noto Sans KR', sans-serif; }
        .question { margin-bottom: 30px; page-break-inside: avoid; }
        .correct { color: #10b981; font-weight: bold; }
        .explanation { background: #f3f4f6; padding: 15px; border-radius: 8px; }
    </style>
</head>
<body>
    <h1>📚 퀴즈 해설지 - [주제명]</h1>
    <p>총 문항 수: [선택된 문항 수]개 (OX형: [수]개, 4지선다: [수]개)</p>
    
    <div class="question">
        <h3>📝 [1번] 동물농장에서 처음 반란을 일으키게 된 직접적 계기는 무엇인가?</h3>
        <ul>
            <li>① 메이저 영감의 연설</li>
            <li>② 존스의 동물 학대</li>
            <li>③ 스노볼의 선동</li>
            <li>④ 나폴레옹의 명령</li>
        </ul>
        <p class="correct">💡 정답: ① 메이저 영감의 연설</p>
        <div class="explanation">
            <strong>📖 해설:</strong> 메이저 영감의 연설이 동물들에게 혁명의 필요성을 깨닫게 해주었습니다...
        </div>
    </div>
    
    <!-- 추가 문항들... -->
</body>
</html>
```

#### **활용 시나리오**
- **수업 전**: Kahoot CSV 업로드로 실시간 퀴즈
- **수업 중**: HTML 버전으로 화면 공유  
- **수업 후**: PDF 해설집으로 복습 자료 제공

### 3.4 제한사항
1. **Kahoot 규격**:
   - 질문: 최대 95자
   - 선택지: 최대 60자
   - 시간: 5-240초

#### **3가지 내보내기 유형**
1. **문항만** (Questions Only)
   - Kahoot 업로드용 CSV/XLSX
   - 학생용 시험지 HTML/PDF

2. **정답 포함** (With Answers)  
   - 교사용 답안지
   - 채점용 자료

3. **정답+해설** (Answer Sheet)
   - 학습용 자료
   - 복습용 해설집
   - 인쇄용 PDF (A4 최적화)

#### **활용 시나리오**
- **수업 전**: Kahoot CSV 업로드로 실시간 퀴즈
- **수업 중**: HTML 버전으로 화면 공유  
- **수업 후**: PDF 해설집으로 복습 자료 제공

## 4. 주요 화면 구성 (탭 기반 통합 인터페이스)

### 4.1 전체 레이아웃

#### **상단 탭 네비게이션**
```
┌─────────────────────────────────────────────────┐
│  📝 퀴즈 생성  │  💾 내 퀴즈  │  🌍 커뮤니티  │
└─────────────────────────────────────────────────┘
```

### 4.2 탭 1: 퀴즈 생성 (Create Quiz)

#### **4.2.1 퀴즈 빌더 영역**
- **주제 입력 필드** (Topic Input)
- **문항 유형 선택** (OX형, 4지선다형)
- **문항 수 및 난이도 설정**
- **시간 제한 설정** (OX형 20초, 4지선다 30초 기본값)
- **퀴즈 만들기 버튼**

#### **4.2.2 문항 미리보기 영역**
- **문항 선택 체크박스** 기능
- **전체 선택/해제** 및 **빠른 선택** 도구
- **Kahoot 업로드 방법 안내**
- **내보내기 버튼** → 내보내기 모달 팝업

#### **4.2.3 내보내기 & 저장 모달**
```
┌─────────────────────────────────────┐
│        퀴즈 내보내기 & 저장         │
├─────────────────────────────────────┤
│ □ Kahoot 퀴즈 파일 (CSV/Excel)     │
│ □ 교사용 해설지 (HTML)             │
│                                     │
│ 제목: [________________]           │
│ 설명: [________________]           │
│ 공개설정: ○ 공개  ○ 비공개         │
│                                     │
│  [다운로드만]  [저장 & 공유]       │
└─────────────────────────────────────┘
```

### 4.3 탭 2: 내 퀴즈 (My Quizzes)

#### **구성 요소**
- **퀴즈 목록 표시** (카드 또는 테이블 형태)
  - 제목, 주제, 생성일, 문항 수
  - 공개/비공개 상태
  - 다운로드 수 (공개 퀴즈의 경우)
- **액션 버튼들**
  - 파일 다운로드 (CSV, Excel, HTML)
  - 수정하기 (문항 편집)
  - 공유 설정 변경
  - 삭제하기

### 4.4 탭 3: 커뮤니티 (Community)

#### **구성 요소**
- **검색 및 필터링**
  - 주제별 검색
  - 문항 유형 필터 (OX형, 4지선다, 혼합)
  - 난이도 필터
  - 인기순/최신순 정렬
- **퀴즈 목록 표시**
  - 작성자, 제목, 주제, 생성일
  - 문항 수, 다운로드 수, 평점
  - 미리보기 버튼
- **상세보기 모달**
  - 문항 미리보기
  - 다운로드 버튼 (CSV, Excel, HTML)
  - 평가 및 댓글 (선택사항)

## 5. 데이터베이스 스키마

### 5.1 테이블 구조

#### **5.1.1 users (사용자)**
```sql
-- NextAuth 세션과 연동되는 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin')),
  google_id VARCHAR(255) UNIQUE, -- Google OAuth ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **5.1.2 quizzes (퀴즈)**
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  topic VARCHAR(500) NOT NULL,
  description TEXT,
  total_questions INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **5.1.3 questions (문항)**
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL CHECK (LENGTH(question_text) <= 95),
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('true_false', 'multiple_choice')),
  difficulty VARCHAR(10) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  time_limit INTEGER DEFAULT 20 CHECK (time_limit BETWEEN 10 AND 60),
  correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 1 AND 4), -- Kahoot 방식: 1,2,3,4
  hint TEXT,
  explanation TEXT, -- 정답 해설
  order_index INTEGER NOT NULL,
  is_selected BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **5.1.4 question_options (선택지)**
```sql
CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  option_text VARCHAR(60) NOT NULL,
  option_order INTEGER NOT NULL CHECK (option_order BETWEEN 1 AND 4),
  is_correct BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **5.1.5 quiz_exports (내보내기 이력)**
```sql
CREATE TABLE quiz_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  export_format VARCHAR(10) NOT NULL CHECK (export_format IN ('csv', 'xlsx', 'html')),
  export_type VARCHAR(20) DEFAULT 'kahoot_quiz' CHECK (export_type IN ('kahoot_quiz', 'teacher_guide')),
  selected_questions_count INTEGER NOT NULL,
  file_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
```sql
CREATE TABLE shared_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  subject_category VARCHAR(100), -- 주제 분류 (예: 문학, 역사, 과학)
  grade_level VARCHAR(50), -- 학년 수준
  total_questions INTEGER NOT NULL,
  true_false_count INTEGER DEFAULT 0,
  multiple_choice_count INTEGER DEFAULT 0,
  
  -- 파일 저장 정보
  kahoot_csv_url TEXT, -- CSV 파일 URL
  kahoot_excel_url TEXT, -- Excel 파일 URL  
  guide_html_url TEXT, -- HTML 해설지 URL
  
  -- 공유 설정
  is_public BOOLEAN DEFAULT true,
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
  
  -- 통계 정보
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  rating_average DECIMAL(2,1) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **5.1.7 quiz_downloads (다운로드 이력)**
```sql
CREATE TABLE quiz_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_quiz_id UUID REFERENCES shared_quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('csv', 'xlsx', 'html')),
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **5.1.8 quiz_ratings (평가)**
```sql
CREATE TABLE quiz_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_quiz_id UUID REFERENCES shared_quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(shared_quiz_id, user_id) -- 한 사용자당 하나의 평가만
);
```

### 5.2 인덱스

```sql
-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX idx_quizzes_status ON quizzes(status);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_questions_order ON questions(quiz_id, order_index);
CREATE INDEX idx_question_options_question_id ON question_options(question_id);
CREATE INDEX idx_quiz_exports_user_id ON quiz_exports(user_id);

-- 공유 퀴즈 관련 인덱스
CREATE INDEX idx_shared_quizzes_user_id ON shared_quizzes(user_id);
CREATE INDEX idx_shared_quizzes_public ON shared_quizzes(is_public, visibility);
CREATE INDEX idx_shared_quizzes_category ON shared_quizzes(subject_category);
CREATE INDEX idx_shared_quizzes_downloads ON shared_quizzes(download_count DESC);
CREATE INDEX idx_shared_quizzes_rating ON shared_quizzes(rating_average DESC);
CREATE INDEX idx_shared_quizzes_created ON shared_quizzes(created_at DESC);

-- 다운로드 및 평가 인덱스  
CREATE INDEX idx_quiz_downloads_shared_quiz ON quiz_downloads(shared_quiz_id);
CREATE INDEX idx_quiz_downloads_user ON quiz_downloads(user_id);
CREATE INDEX idx_quiz_ratings_shared_quiz ON quiz_ratings(shared_quiz_id);
```

### 5.3 Row Level Security (RLS) 정책

```sql
-- RLS 활성화
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_ratings ENABLE ROW LEVEL SECURITY;

-- 퀴즈 접근 정책 (NextAuth 세션 기반)
CREATE POLICY "Users can view own quizzes" ON quizzes
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)
    )
  );

CREATE POLICY "Users can create own quizzes" ON quizzes
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)
    )
  );

CREATE POLICY "Users can update own quizzes" ON quizzes
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)
    )
  );

CREATE POLICY "Users can delete own quizzes" ON quizzes
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)
    )
  );

-- 문항 접근 정책
CREATE POLICY "Users can access questions of own quizzes" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      JOIN users ON users.id = quizzes.user_id
      WHERE quizzes.id = questions.quiz_id 
      AND users.email = current_setting('app.current_user_email', true)
    )
  );

-- 선택지 접근 정책
CREATE POLICY "Users can access options of own questions" ON question_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM questions 
      JOIN quizzes ON quizzes.id = questions.quiz_id
      JOIN users ON users.id = quizzes.user_id
      WHERE questions.id = question_options.question_id 
      AND users.email = current_setting('app.current_user_email', true)
    )
  );

-- 내보내기 이력 정책
CREATE POLICY "Users can view own exports" ON quiz_exports
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)
    )
  );

CREATE POLICY "Users can record exports" ON quiz_exports
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)
    )
  );

-- 공유 퀴즈 접근 정책
CREATE POLICY "Users can view public shared quizzes" ON shared_quizzes
  FOR SELECT USING (
    is_public = true OR 
    user_id IN (
      SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)
    )
  );

CREATE POLICY "Users can create own shared quizzes" ON shared_quizzes
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)
    )
  );

CREATE POLICY "Users can update own shared quizzes" ON shared_quizzes
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)
    )
  );

CREATE POLICY "Users can delete own shared quizzes" ON shared_quizzes
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)
    )
  );

-- 다운로드 이력 정책
CREATE POLICY "Users can view own downloads" ON quiz_downloads
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)
    )
  );

CREATE POLICY "Users can record downloads" ON quiz_downloads
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)
    )
  );

-- 평가 정책
CREATE POLICY "Users can view all ratings" ON quiz_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can create own ratings" ON quiz_ratings
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)
    )
  );

CREATE POLICY "Users can update own ratings" ON quiz_ratings
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)
    )
  );
```

### 5.4 Kahoot 내보내기 형식

#### **CSV/XLSX 필드 매핑**
```
Question,Answer 1,Answer 2,Answer 3,Answer 4,Time limit,Correct answer(s)
```

#### **문항 유형별 데이터 구조**

**OX형 (True/False)**
```json
{
  "question_type": "true_false",
  "options": [
    {"option_text": "True", "option_order": 1, "is_correct": true},
    {"option_text": "False", "option_order": 2, "is_correct": false}
  ]
}
```

**4지선다형 (Multiple Choice)**
```json
{
  "question_type": "multiple_choice",
  "options": [
    {"option_text": "선택지 1", "option_order": 1, "is_correct": false},
    {"option_text": "선택지 2", "option_order": 2, "is_correct": true},
    {"option_text": "선택지 3", "option_order": 3, "is_correct": false},
    {"option_text": "선택지 4", "option_order": 4, "is_correct": false}
  ]
}
```

### 5.5 데이터 유효성 검증

#### **필드 제한사항**
- **질문**: 최대 95자 (Kahoot 규격)
- **선택지**: 최대 60자 (Kahoot 규격)
- **시간**: 5-240초 범위
- **기본 Time limit 값**: 20초

#### **비즈니스 규칙**
- OX형: 정확히 2개의 선택지 (True/False)
- 4지선다형: 정확히 4개의 선택지
- 각 문항당 정답은 최소 1개 이상
- 복수정답 가능 (multiple correct answers)

### 5.6 샘플 데이터

```sql
-- 샘플 퀴즈 데이터 (NextAuth 세션 기반)
INSERT INTO quizzes (user_id, title, topic, description) VALUES
((SELECT id FROM users WHERE email = current_setting('app.current_user_email', true)), '한국사 기초', '조선시대 역사', 'AI가 생성한 조선시대 관련 퀴즈');

-- 샘플 문항 데이터 (OX형)
INSERT INTO questions (quiz_id, question_text, question_type, difficulty, correct_answer, order_index) VALUES
((SELECT id FROM quizzes WHERE title = '한국사 기초'), '세종대왕이 한글을 창제했다.', 'true_false', 'easy', 'True', 1);

-- 샘플 선택지 데이터
INSERT INTO question_options (question_id, option_text, option_order, is_correct) VALUES
((SELECT id FROM questions WHERE question_text LIKE '세종대왕%'), 'True', 1, true),
((SELECT id FROM questions WHERE question_text LIKE '세종대왕%'), 'False', 2, false);
```

## 6. UI/UX 디자인 가이드라인

### 6.1 디자인 일관성
- **색상 팔레트**: 
  - Primary: #3b82f6 (Blue)
  - Secondary: #10b981 (Green)
  - Accent: #f59e0b (Orange)
  - 기존 앱들과 통일
- **타이포그래피**: 
  - 제목: Geist Sans
  - 본문: Noto Sans KR
  - 코드: Geist Mono
- **컴포넌트**: @bluenote/ui 공통 컴포넌트 활용

### 6.2 UI/UX 고려사항

**사용자 경험**
- 단계별 진행 표시기 (Progress Indicator)
- 로딩 상태 표시
- 에러 처리 및 알림 메시지
- 자동 저장 기능

**접근성**
- 키보드 네비게이션 지원
- Screen Reader 호환
- 명확한 레이블링

### 6.3 반응형 디자인
- **모바일**: 세로 모드 최적화
- **태블릿**: 가로/세로 모드 지원
- **데스크톱**: 멀티 패널 레이아웃

## 7. 개발 단계별 구현 계획

### Phase 1: 기본 설정 (1-2일)
- [ ] 프로젝트 초기 설정 (Next.js)
- [ ] **monorepo 통합 설정**
  - [ ] pnpm-workspace.yaml에 추가
  - [ ] turbo.json에 quiz 앱 추가
  - [ ] 포트 3003 설정
- [ ] 기본 라우팅 구조 (3개 탭)
- [ ] **공통 패키지 연동**
  - [ ] @bluenote/ui 컴포넌트 통합
  - [ ] @bluenote/auth NextAuth 설정
  - [ ] @bluenote/config 설정 상속
- [ ] **Supabase 프로젝트 생성 및 연동**
- [ ] **데이터베이스 테이블 생성**
  - [ ] users, quizzes, questions, question_options, quiz_exports
  - [ ] shared_quizzes, quiz_downloads, quiz_ratings
  - [ ] 인덱스 및 NextAuth 기반 RLS 정책 설정
- [ ] **Google OAuth 설정**

### Phase 2: 핵심 기능 (3-4일)
- [ ] 퀴즈 빌더 화면 구현
  - [ ] 주제 입력 및 기본 설정
  - [ ] **문항 유형별 시간 제한 설정** (OX형 20초, 4지선다 30초 기본값, 10-60초 범위)
  - [ ] 문항 수 및 난이도 설정
- [ ] 문항 미리보기 화면 구현
  - [ ] 문항 목록 표시 및 편집
  - [ ] **문항 선택 체크박스 기능**
  - [ ] **전체 선택/해제 기능**
  - [ ] **선택된 문항 수 표시**
  - [ ] **Kahoot 형식 미리보기** (정답 숫자 표시)
- [ ] AI 기반 문항 생성 로직 (Claude API)
  - [ ] **실제 CSV 패턴 기반 문항 생성**
  - [ ] **OX형/4지선다형 구분 처리**
- [ ] 데이터베이스 CRUD 기능
- [ ] **선택된 문항 데이터 관리**

### Phase 3: 내보내기 기능 (2-3일)
- [ ] **Kahoot 퀴즈 파일 생성** (CSV/Excel)
  - [ ] 7컬럼 구조 정확히 구현
  - [ ] OX형 문항 처리 (Answer 3,4 빈 값)
  - [ ] 정답 숫자 인덱스 변환 (1,2,3,4)
  - [ ] 문항 순서 정렬 (OX형 → 4지선다형)
- [ ] **교사용 해설지 생성** (HTML)
  - [ ] 미리보기와 동일한 내용
  - [ ] 문항, 선택지, 정답, 해설 모두 포함
  - [ ] 인쇄 친화적 스타일링
  - [ ] 저장 가능한 HTML 파일
- [ ] **파일 다운로드 시스템**
  - [ ] 파일명 자동 생성
  - [ ] 브라우저 다운로드 처리
- [ ] **CSV 형식 검증 기능**
  - [ ] Kahoot 업로드 가능 여부 체크
  - [ ] 문항/선택지 길이 제한 확인

### Phase 4: 마무리 및 배포 (2-3일)
- [ ] 반응형 디자인 적용
- [ ] 에러 처리 및 사용자 피드백
- [ ] 성능 최적화
- [ ] **도메인 설정 및 배포**
  - [ ] Vercel 프로젝트 생성
  - [ ] 환경 변수 설정 (SUPABASE_URL, API_KEYS 등)
  - [ ] quiz.bluenote.site 도메인 연결
  - [ ] DNS 설정 확인
  - [ ] SSL 인증서 설정
  - [ ] CDN 및 캐싱 최적화
- [ ] **SEO 및 메타데이터 설정**
  - [ ] robots.txt, sitemap.xml
  - [ ] Open Graph 메타태그
  - [ ] 구글 애널리틱스 연동

## 8. 기술 구조

### 8.1 폴더 구조

```
src/
├── app/
│   ├── (auth)/           # 인증 관련 페이지
│   │   ├── signin/
│   │   └── error/
│   ├── (quiz)/
│   │   ├── create/       # 퀴즈 생성 탭
│   │   ├── my-quizzes/   # 내 퀴즈 탭
│   │   └── community/    # 커뮤니티 탭
│   └── api/
│       ├── auth/         # NextAuth 엔드포인트
│       └── quizzes/      # 퀴즈 API
├── components/
│   ├── QuizBuilder/
│   ├── QuestionPreview/
│   │   ├── QuestionCard.js
│   │   ├── SelectionControls.js
│   │   └── QuickSelectButtons.js
│   ├── Export/
│   └── Navigation/       # 탭 네비게이션
├── lib/
│   ├── auth.js          # @bluenote/auth 통합
│   ├── supabase.js
│   ├── claude-api.js
│   ├── quiz-generator.js
│   ├── file-export.js
│   ├── question-selection.js
│   ├── html-generator.js  // 해설지 HTML 생성
│   ├── kahoot-exporter.js // Kahoot CSV/Excel 생성
│   └── database/
│       ├── queries.js
│       ├── migrations.sql
│       └── seed-data.sql
└── middleware.js        # NextAuth 미들웨어
```

### 8.2 핵심 라이브러리

```json
{
  "dependencies": {
    "next": "^15.3.5",
    "react": "^19.0.0",
    "react-hook-form": "^7.0.0",
    "js-xlsx": "^0.18.0",
    "file-saver": "^2.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "@dnd-kit/core": "^6.0.0",
    "@dnd-kit/sortable": "^7.0.0",
    "react-use": "^17.0.0",
    "@bluenote/ui": "workspace:*",
    "@bluenote/auth": "workspace:*",
    "@bluenote/config": "workspace:*",
    "next-auth": "^5.0.0"
  }
}
```

**라이브러리 설명**
- `@dnd-kit/core`, `@dnd-kit/sortable`: 문항 순서 변경 (Drag & Drop)
- `react-use`: 다중 선택 상태 관리를 위한 유틸리티 훅
- `js-xlsx`: Excel 파일 생성 (Kahoot 업로드용)
- `file-saver`: 파일 다운로드 기능

### 8.3 API 엔드포인트

#### **퀴즈 관리**
```
GET    /api/quizzes - 사용자 퀴즈 목록 조회
POST   /api/quizzes - 새 퀴즈 생성
GET    /api/quizzes/[id] - 특정 퀴즈 상세 조회
PUT    /api/quizzes/[id] - 퀴즈 정보 수정
DELETE /api/quizzes/[id] - 퀴즈 삭제
```

#### **문항 관리**
```
GET    /api/quizzes/[id]/questions - 퀴즈 문항 목록
POST   /api/quizzes/[id]/questions - 문항 추가
PUT    /api/questions/[id] - 문항 수정
DELETE /api/questions/[id] - 문항 삭제
PATCH  /api/questions/bulk-update - 문항 순서/선택상태 일괄 수정
```

#### **AI 기능**
```
POST   /api/ai/generate-questions - AI 문항 생성
Body: {
  topic: string,
  questionTypes: ['true_false', 'multiple_choice'],
  counts: { true_false: number, multiple_choice: number },
  difficulty: 'easy' | 'medium' | 'hard'
}
```

#### **내보내기 & 저장**
```
POST   /api/export/kahoot - Kahoot 퀴즈 파일 생성 (CSV/Excel)
POST   /api/export/guide - 교사용 해설지 생성 (HTML)
POST   /api/share/save - 퀴즈 공유 저장

Body (공유 저장): {
  quizId: string,
  selectedQuestionIds: string[],
  shareData: {
    title: string,
    description: string,
    subjectCategory: string,
    gradeLevel: string,
    isPublic: boolean,
    visibility: 'public' | 'private' | 'unlisted'
  }
}
```

#### **공유 퀴즈 관리**
```
GET    /api/shared-quizzes - 공개 퀴즈 목록 (검색, 필터링)
GET    /api/shared-quizzes/my - 내가 공유한 퀴즈 목록
GET    /api/shared-quizzes/[id] - 공유 퀴즈 상세 조회
PUT    /api/shared-quizzes/[id] - 공유 퀴즈 수정
DELETE /api/shared-quizzes/[id] - 공유 퀴즈 삭제

Query Parameters (공개 퀴즈 목록):
- search: 제목/설명 검색
- category: 주제 분류 필터
- gradeLevel: 학년 필터  
- questionType: 문항 유형 필터
- sort: 정렬 (latest, popular, rating)
- page, limit: 페이지네이션
```

#### **다운로드 & 평가**
```
POST   /api/shared-quizzes/[id]/download - 공유 퀴즈 다운로드
GET    /api/shared-quizzes/[id]/files/[type] - 파일 다운로드 (csv, xlsx, html)
POST   /api/shared-quizzes/[id]/rate - 퀴즈 평가
GET    /api/shared-quizzes/[id]/ratings - 평가 목록 조회
```

#### **통계 및 이력**
```
GET    /api/quizzes/[id]/stats - 퀴즈 통계
GET    /api/downloads/history - 다운로드 이력
GET    /api/dashboard/stats - 대시보드 통계 (내 퀴즈, 다운로드 수 등)
```

## 9. 개발 시 주의사항

### 9.1 코드 컨벤션
- JavaScript 사용 (TypeScript 미사용 - web 앱과 통일)
- 함수형 컴포넌트 및 Hooks 사용
- 한글 주석 적극 활용
- 컴포넌트별 JSDoc 작성
- API 응답 형식: `{ data, error, message }` 패턴 준수
- 컴포넌트 구조: monorepo 패턴 준수

### 9.2 git 커밋 메시지
```
feat: 새로운 기능 추가
fix: 버그 수정  
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 업무 수정
```

### 9.3 브랜치 전략
- main: 프로덕션 배포
- develop: 개발 브랜치
- feature/*: 기능 개발
- hotfix/*: 긴급 수정

### 9.4 데이터베이스 관리

#### **마이그레이션 관리**
- Supabase CLI를 통한 스키마 버전 관리
- 개발/스테이징/프로덕션 환경별 분리
- 데이터 백업 및 복구 전략

#### **성능 최적화**
- 쿼리 성능 모니터링
- 적절한 인덱스 설정
- Connection pooling 활용

#### **데이터 보안**
- RLS 정책을 통한 데이터 접근 제어
- 민감 정보 암호화
- API Rate Limiting 적용

## 11. 배포 및 도메인 설정

### 11.1 도메인 구성
- **메인 도메인**: quiz.bluenote.site
- **관리 요구사항**: 
  - bluenote.site DNS 관리 권한 필요
  - 서브도메인 CNAME 레코드 설정

### 11.2 Vercel 배포 설정

#### **프로젝트 설정**
```json
{
  "name": "quiz-bluenote",
  "framework": "nextjs", 
  "buildCommand": "cd ../.. && pnpm build --filter=quiz",
  "outputDirectory": "apps/quiz/.next",
  "installCommand": "pnpm install",
  "nodeVersion": "18.x",
  "rootDirectory": "apps/quiz"
}
```

#### **환경 변수 설정**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://quiz.bluenote.site

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Claude AI  
CLAUDE_API_KEY=
ANTHROPIC_API_KEY=

# 환경별 구분
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Base URL
NEXT_PUBLIC_BASE_URL=https://quiz.bluenote.site
```

#### **도메인 연결 체크리스트**
- [ ] Vercel 프로젝트에서 Custom Domain 추가
- [ ] DNS에서 quiz.bluenote.site → Vercel 레코드 연결
- [ ] SSL 인증서 자동 발급 확인
- [ ] HTTPS 리다이렉트 설정
- [ ] www 리다이렉트 설정 (선택사항)

### 11.3 성능 최적화
```json
{
  "next.config.js": {
    "compress": true,
    "images": {
      "domains": ["quiz.bluenote.site"],
      "formats": ["image/webp", "image/avif"]
    },
    "experimental": {
      "optimizeCss": true
    }
  }
}
```

### 11.4 모니터링 설정
- **Vercel Analytics**: 사용자 트래픽 분석
- **Vercel Speed Insights**: 성능 모니터링  
- **Sentry**: 에러 트래킹 (선택사항)
- **Google Analytics**: 사용자 행동 분석

### 11.5 보안 설정
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options', 
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

## 12. 참고 자료

### 12.1 기존 앱 참고
- `/apps/web`: 전체적인 구조 및 인증 시스템 (Next.js 15.3.4)
- `/apps/grading`: UI 컴포넌트 및 평가 로직 (Next.js 15.3.5)
- `/packages/ui`: 공통 컴포넌트 사용법

### 12.2 외부 참고
- Kahoot: 실시간 퀴즈 UX
- Google Forms: 폼 빌더 UI
- Quizizz: 게임화 요소
- Mentimeter: 프레젠테이션 통합

---

**총 개발 기간**: 약 3-4주일 (커뮤니티 기능 포함)  
**배포 방식**: Vercel monorepo 배포 (quiz.bluenote.site)  
**데이터 저장**: Supabase PostgreSQL + Storage + 실시간 동기화  
**인증**: @bluenote/auth (NextAuth + Google OAuth)  
**UI**: @bluenote/ui 공통 컴포넌트 활용