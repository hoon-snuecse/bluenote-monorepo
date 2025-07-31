# RLS 적용에 따른 앱 및 데이터베이스 개선 계획

## 1. 데이터베이스 스키마 개선

### 1.1 샘플 데이터 표시를 위한 컬럼 추가

#### Quiz 앱 테이블
```sql
-- quizzes 테이블에 샘플 표시 컬럼 추가
ALTER TABLE public.quizzes 
ADD COLUMN is_sample BOOLEAN DEFAULT false,
ADD COLUMN sample_order INTEGER DEFAULT NULL;

-- shared_quizzes 테이블에도 추가
ALTER TABLE public.shared_quizzes 
ADD COLUMN is_sample BOOLEAN DEFAULT false,
ADD COLUMN sample_order INTEGER DEFAULT NULL;
```

#### Grading 앱 테이블
```sql
-- Assignment 테이블에 샘플 표시 컬럼 추가
ALTER TABLE public."Assignment" 
ADD COLUMN "isSample" BOOLEAN DEFAULT false,
ADD COLUMN "sampleOrder" INTEGER DEFAULT NULL,
ADD COLUMN "sampleCategory" VARCHAR(50) DEFAULT NULL; -- '초등', '중등', '고등' 등

-- EvaluationTemplate 테이블에도 추가
ALTER TABLE public."EvaluationTemplate" 
ADD COLUMN "isSample" BOOLEAN DEFAULT false,
ADD COLUMN "sampleOrder" INTEGER DEFAULT NULL;
```

### 1.2 RLS 정책 수정 - 샘플 데이터 허용

#### Quiz 앱 RLS 정책
```sql
-- quizzes 테이블 정책 수정
DROP POLICY IF EXISTS "Users can view own quizzes" ON public.quizzes;

CREATE POLICY "Users can view own and sample quizzes" ON public.quizzes
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()::text 
        OR is_sample = true
    );

-- shared_quizzes 테이블 정책 수정
DROP POLICY IF EXISTS "Users can view public shared quizzes" ON public.shared_quizzes;

CREATE POLICY "Users can view public and sample shared quizzes" ON public.shared_quizzes
    FOR SELECT
    TO authenticated
    USING (
        is_public = true 
        OR user_id = auth.uid()::text 
        OR is_sample = true
    );
```

#### Grading 앱 RLS 정책
```sql
-- Assignment 테이블 정책 수정
DROP POLICY IF EXISTS "Users can manage own assignments" ON public."Assignment";

CREATE POLICY "Users can view own and sample assignments" ON public."Assignment"
    FOR SELECT
    TO authenticated
    USING (
        email = auth.jwt() ->> 'email' 
        OR "isSample" = true
    );

CREATE POLICY "Users can manage own assignments" ON public."Assignment"
    FOR INSERT, UPDATE, DELETE
    TO authenticated
    USING (email = auth.jwt() ->> 'email')
    WITH CHECK (email = auth.jwt() ->> 'email');

-- EvaluationTemplate 테이블 정책 수정
DROP POLICY IF EXISTS "Users can manage own templates" ON public."EvaluationTemplate";

CREATE POLICY "Users can view own and sample templates" ON public."EvaluationTemplate"
    FOR SELECT
    TO authenticated
    USING (
        email = auth.jwt() ->> 'email' 
        OR "isSample" = true
    );

CREATE POLICY "Users can manage own templates" ON public."EvaluationTemplate"
    FOR INSERT, UPDATE, DELETE
    TO authenticated
    USING (email = auth.jwt() ->> 'email')
    WITH CHECK (email = auth.jwt() ->> 'email');
```

## 2. 앱 코드 개선

### 2.1 Quiz 앱 개선

#### `/apps/quiz/src/app/(quiz)/my-quizzes/page.js`
```javascript
// 내 퀴즈 조회 시 샘플 퀴즈도 포함
const fetchQuizzes = async () => {
  try {
    // 세션 컨텍스트 설정
    await supabase.rpc('set_current_user_email', { 
      email: session.user.email 
    })

    // 내 퀴즈와 샘플 퀴즈를 분리하여 조회
    const [myQuizzes, sampleQuizzes] = await Promise.all([
      // 내 퀴즈
      supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_sample', false)
        .order('created_at', { ascending: false }),
      
      // 샘플 퀴즈
      supabase
        .from('quizzes')
        .select('*')
        .eq('is_sample', true)
        .order('sample_order', { ascending: true })
    ])

    // UI에서 구분하여 표시
    setMyQuizzes(myQuizzes.data || [])
    setSampleQuizzes(sampleQuizzes.data || [])
  } catch (error) {
    console.error('퀴즈 로드 실패:', error)
  }
}

// UI 렌더링
return (
  <div className="container mx-auto p-6">
    {/* 샘플 퀴즈 섹션 */}
    {sampleQuizzes.length > 0 && (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          📚 샘플 퀴즈
          <span className="text-sm text-gray-500 ml-2">
            (시작하기 좋은 예제들)
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleQuizzes.map(quiz => (
            <QuizCard 
              key={quiz.id} 
              quiz={quiz} 
              isSample={true}
              onDelete={null} // 샘플은 삭제 불가
            />
          ))}
        </div>
      </div>
    )}

    {/* 내 퀴즈 섹션 */}
    <div>
      <h2 className="text-2xl font-bold mb-4">
        💾 내 퀴즈
        <span className="text-sm text-gray-500 ml-2">
          ({myQuizzes.length}개)
        </span>
      </h2>
      {myQuizzes.length === 0 ? (
        <EmptyState 
          message="아직 생성한 퀴즈가 없습니다."
          action={
            <Link href="/create" className="btn btn-primary">
              첫 퀴즈 만들기
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myQuizzes.map(quiz => (
            <QuizCard 
              key={quiz.id} 
              quiz={quiz} 
              isSample={false}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  </div>
)
```

### 2.2 Grading 앱 개선

#### `/apps/grading/src/app/assignments/page.tsx`
```typescript
// 과제 목록 조회 시 샘플 과제도 포함
const fetchAssignments = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 내 과제와 샘플 과제를 분리하여 조회
    const [myAssignments, sampleAssignments] = await Promise.all([
      // 내 과제
      supabase
        .from('Assignment')
        .select('*')
        .eq('email', user.email)
        .eq('isSample', false)
        .order('createdAt', { ascending: false }),
      
      // 샘플 과제
      supabase
        .from('Assignment')
        .select('*')
        .eq('isSample', true)
        .order('sampleOrder', { ascending: true })
    ])

    setMyAssignments(myAssignments.data || [])
    setSampleAssignments(sampleAssignments.data || [])
  } catch (error) {
    console.error('과제 로드 실패:', error)
  }
}

// UI 렌더링
return (
  <div className="container mx-auto py-8">
    {/* 샘플 과제 섹션 */}
    {sampleAssignments.length > 0 && (
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-2">
          📝 샘플 과제
        </h2>
        <p className="text-gray-600 mb-4">
          평가 시스템을 시작하기 좋은 예제 과제들입니다.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleAssignments.map(assignment => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              isSample={true}
              badge={assignment.sampleCategory} // '초등', '중등' 등
            />
          ))}
        </div>
      </div>
    )}

    {/* 내 과제 섹션 */}
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          내 과제 ({myAssignments.length})
        </h2>
        <Link
          href="/assignments/new"
          className="btn btn-primary"
        >
          새 과제 만들기
        </Link>
      </div>
      
      {myAssignments.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-16 h-16 text-gray-400" />}
          title="아직 생성한 과제가 없습니다"
          description="새 과제를 만들어 학생들의 글쓰기를 평가해보세요."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myAssignments.map(assignment => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              isSample={false}
            />
          ))}
        </div>
      )}
    </div>
  </div>
)
```

## 3. 샘플 데이터 삽입 스크립트

### 3.1 Quiz 앱 샘플 데이터
```sql
-- 샘플 퀴즈 데이터 삽입
INSERT INTO public.quizzes (
  user_id, title, subject, topic, grade_level, 
  difficulty, question_count, time_per_question,
  is_sample, sample_order, created_at
) VALUES 
  ('00000000-0000-0000-0000-000000000000', '한국사 기초 퀴즈', 'history', '조선시대', 'middle', 'medium', 10, 30, true, 1, NOW()),
  ('00000000-0000-0000-0000-000000000000', '수학 기초 연산', 'math', '사칙연산', 'elementary', 'easy', 15, 20, true, 2, NOW()),
  ('00000000-0000-0000-0000-000000000000', '영어 단어 퀴즈', 'english', '기초 어휘', 'elementary', 'easy', 20, 15, true, 3, NOW());

-- 샘플 공유 퀴즈
INSERT INTO public.shared_quizzes (
  quiz_id, user_id, title, description, subject,
  is_public, is_sample, sample_order
) VALUES 
  ('[위에서 생성된 quiz_id]', '00000000-0000-0000-0000-000000000000', 
   '한국사 기초 퀴즈', '조선시대 주요 사건과 인물에 대한 퀴즈입니다.', 
   'history', true, true, 1);
```

### 3.2 Grading 앱 샘플 데이터
```sql
-- 샘플 과제 데이터 삽입
INSERT INTO public."Assignment" (
  email, title, description, "targetGrade", "dueDate",
  "isSample", "sampleOrder", "sampleCategory", "createdAt"
) VALUES 
  ('sample@bluenote.site', '나의 꿈 (초등)', '장래희망에 대해 자유롭게 써보세요.', '초등 4학년', NOW() + INTERVAL '30 days', true, 1, '초등', NOW()),
  ('sample@bluenote.site', '독후감 쓰기 (중등)', '좋아하는 책을 읽고 느낀 점을 작성하세요.', '중학교 2학년', NOW() + INTERVAL '30 days', true, 2, '중등', NOW()),
  ('sample@bluenote.site', '논설문 작성 (고등)', '사회 이슈에 대한 자신의 견해를 논리적으로 서술하세요.', '고등학교 1학년', NOW() + INTERVAL '30 days', true, 3, '고등', NOW());

-- 샘플 평가 템플릿
INSERT INTO public."EvaluationTemplate" (
  email, name, description, criteria,
  "isSample", "sampleOrder", "createdAt"
) VALUES 
  ('sample@bluenote.site', '기본 평가 기준', '일반적인 글쓰기 평가에 사용할 수 있는 기본 템플릿입니다.', 
   '{"clarity": 25, "evidence": 25, "structure": 25, "expression": 25}'::jsonb,
   true, 1, NOW());
```

## 4. UI/UX 개선 사항

### 4.1 샘플 데이터 시각적 구분
- 샘플 카드에 "샘플" 배지 표시
- 다른 배경색 또는 테두리 색상 사용
- 아이콘으로 구분 (📚 샘플, 👤 내 콘텐츠)

### 4.2 권한 제한 표시
- 샘플 데이터는 수정/삭제 버튼 비활성화
- "샘플은 수정할 수 없습니다" 툴팁 표시
- 샘플을 복사하여 내 콘텐츠로 만들기 기능 제공

### 4.3 온보딩 개선
- 첫 방문 사용자에게 샘플 데이터 안내
- "샘플로 시작하기" 버튼 제공
- 샘플 사용 후 자신만의 콘텐츠 만들기 유도

## 5. 구현 순서

1. **데이터베이스 스키마 업데이트** (우선순위: 높음)
   - 샘플 표시 컬럼 추가
   - RLS 정책 수정

2. **샘플 데이터 삽입** (우선순위: 높음)
   - 각 앱별 대표 샘플 3-5개 생성

3. **앱 코드 수정** (우선순위: 중간)
   - 데이터 조회 로직 개선
   - UI 컴포넌트 업데이트

4. **UI/UX 개선** (우선순위: 낮음)
   - 시각적 구분 요소 추가
   - 온보딩 플로우 개선