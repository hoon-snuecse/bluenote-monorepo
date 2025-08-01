# Grading 앱 과제 공유 기능 제안서

## 개요
grading 앱에서 교사들이 채점 과제를 전체 사용자와 공유할 수 있는 기능을 추가합니다. 이를 통해 다른 교사들이 샘플 과제를 참고하여 자신만의 평가 기준을 만들 수 있습니다.

### 핵심 개념: "채점 기준 템플릿 공유"
- **공유되는 것**: 평가 기준, 루브릭, 과제 설정
- **공유되지 않는 것**: 학생 정보, 제출물, 평가 결과
- **복사 후**: 완전히 독립적인 새 과제로 각자 운영

## 현재 데이터베이스 구조 분석

### 기존 모델
- `Assignment`: 이미 `isShared`, `sharedAt` 필드가 있음
- `SharedAssignment`: 특정 사용자와의 개별 공유를 위한 모델
- `User`: 사용자 정보 및 권한 관리

### 활용 가능한 필드
```prisma
model Assignment {
  isShared    Boolean   @default(false)  // 전체 공유 여부
  sharedAt    DateTime?                  // 공유 시점
  userId      String?                    // 작성자
  userEmail   String?                    // 작성자 이메일
}
```

## 제안하는 구현 방식

### 1. 공유 유형 구분
- **전체 공유 (Public Share)**: `isShared = true` 사용
- **개별 공유 (Private Share)**: `SharedAssignment` 테이블 사용

### 2. 공유 샘플 갤러리 구조

```typescript
// 공유된 과제 목록 페이지
/app/shared-assignments/page.tsx

// 주요 기능:
- 공유된 과제 목록 표시
- 필터링: 학년별, 글쓰기 유형별, 학교별
- 검색: 제목, 학교명, 평가 기준
- 정렬: 최신순, 인기순(복사 횟수)
```

### 3. UI/UX 설계

#### 3.1 네비게이션 구조

**파일 구조**
```
/app/
├── assignments/              # 기존 내 과제 목록
│   └── [id]/                # 과제 상세
├── shared/                  # 새로운 공유 섹션
│   ├── page.tsx            # 공유 과제 갤러리
│   └── [id]/               # 공유 과제 미리보기
└── components/
    ├── ShareButton.tsx      # 공유 버튼 컴포넌트
    └── SharedAssignmentCard.tsx # 공유 과제 카드
```

**과제 관리 페이지 상단에 탭 추가**
```typescript
// /app/assignments/page.tsx 수정
<div className="container-custom py-8">
  {/* 탭 네비게이션 추가 */}
  <div className="mb-6 border-b border-gray-200">
    <nav className="-mb-px flex space-x-8">
      <button
        onClick={() => setActiveTab('my')}
        className={`py-2 px-1 border-b-2 font-medium text-sm ${
          activeTab === 'my' 
            ? 'border-blue-500 text-blue-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        내 과제
      </button>
      <button
        onClick={() => setActiveTab('shared')}
        className={`py-2 px-1 border-b-2 font-medium text-sm ${
          activeTab === 'shared' 
            ? 'border-blue-500 text-blue-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          공유 템플릿
          <Badge variant="secondary" size="sm">New</Badge>
        </div>
      </button>
    </nav>
  </div>
  
  {/* 탭 컨텐츠 */}
  {activeTab === 'my' ? (
    <MyAssignments />
  ) : (
    <SharedAssignments />
  )}
</div>
```

#### 3.2 주요 UI 컴포넌트

**1. 내 과제 목록에서 공유 버튼**
```typescript
// /app/assignments/page.tsx 수정
<AssignmentCard>
  <CardActions>
    <Button onClick={handleEdit}>수정</Button>
    <Button onClick={handleEvaluate}>평가</Button>
    <Button 
      onClick={handleShare}
      variant="outline"
      icon={<Share2 />}
    >
      공유하기
    </Button>
  </CardActions>
</AssignmentCard>
```

**2. 공유 확인 모달**
```typescript
// components/ShareModal.tsx
<Modal>
  <h2>과제를 공유하시겠습니까?</h2>
  <p>다른 교사들이 이 평가 기준을 참고할 수 있습니다.</p>
  <Alert>
    <AlertCircle />
    <p>학생 정보와 평가 결과는 공유되지 않습니다.</p>
  </Alert>
  <div className="flex gap-2">
    <Button onClick={confirmShare}>공유하기</Button>
    <Button variant="ghost" onClick={cancel}>취소</Button>
  </div>
</Modal>
```

**3. 공유 과제 갤러리 페이지**
```typescript
// /app/shared/page.tsx
<div className="container">
  <PageHeader>
    <h1>공유된 평가 템플릿</h1>
    <p>다른 교사들이 공유한 평가 기준을 참고하세요</p>
  </PageHeader>
  
  {/* 필터 섹션 */}
  <FilterSection>
    <Select placeholder="학년">
      <option>초등 1-2학년</option>
      <option>초등 3-4학년</option>
      <option>초등 5-6학년</option>
      <option>중학교</option>
    </Select>
    <Select placeholder="글쓰기 유형">
      <option>논설문</option>
      <option>설명문</option>
      <option>감상문</option>
    </Select>
    <Input placeholder="검색어 입력" />
  </FilterSection>
  
  {/* 공유 과제 그리드 */}
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
    {sharedAssignments.map(assignment => (
      <SharedAssignmentCard key={assignment.id} {...assignment} />
    ))}
  </div>
</div>
```

**4. 공유 과제 카드 컴포넌트**
```typescript
// components/SharedAssignmentCard.tsx
<Card className="hover:shadow-lg transition-shadow">
  <CardHeader>
    <div className="flex justify-between items-start">
      <Badge>{assignment.gradeLevel}</Badge>
      <Badge variant="outline">{assignment.writingType}</Badge>
    </div>
    <h3 className="font-semibold mt-2">{assignment.title}</h3>
    <p className="text-sm text-gray-600">{assignment.schoolName}</p>
  </CardHeader>
  
  <CardContent>
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <User className="w-4 h-4" />
        <span>공유자: {assignment.sharedBy}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="w-4 h-4" />
        <span>{formatDate(assignment.sharedAt)}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Copy className="w-4 h-4" />
        <span>{assignment.copyCount}명이 사용중</span>
      </div>
    </div>
    
    <div className="mt-4">
      <p className="text-sm font-medium mb-2">평가 영역:</p>
      <div className="flex flex-wrap gap-1">
        {assignment.evaluationDomains.map(domain => (
          <Badge key={domain} variant="secondary" size="sm">
            {domain}
          </Badge>
        ))}
      </div>
    </div>
  </CardContent>
  
  <CardFooter className="gap-2">
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => router.push(`/shared/${assignment.id}`)}
    >
      미리보기
    </Button>
    <Button 
      size="sm"
      onClick={() => handleCopy(assignment.id)}
    >
      내 과제로 복사
    </Button>
  </CardFooter>
</Card>
```

**5. 공유 과제 미리보기 페이지**
```typescript
// /app/shared/[id]/page.tsx
<div className="container max-w-4xl">
  <BackButton href="/shared" />
  
  <AssignmentPreview>
    <h1>{assignment.title}</h1>
    
    {/* 공유 정보 */}
    <Alert className="mb-6">
      <Info className="w-4 h-4" />
      <AlertDescription>
        이 평가 템플릿은 {assignment.sharedBy}님이 공유했습니다.
        복사하면 나만의 과제로 사용할 수 있습니다.
      </AlertDescription>
    </Alert>
    
    {/* 평가 기준 미리보기 */}
    <Section>
      <h2>평가 기준</h2>
      <RubricPreview rubric={assignment.evaluationDomains} />
    </Section>
    
    <Section>
      <h2>평가 수준</h2>
      <LevelsPreview levels={assignment.evaluationLevels} />
    </Section>
    
    <Section>
      <h2>채점 기준 설명</h2>
      <div className="prose">
        {assignment.gradingCriteria}
      </div>
    </Section>
    
    {/* 액션 버튼 */}
    <div className="sticky bottom-4 bg-white p-4 border-t">
      <Button 
        size="lg" 
        className="w-full"
        onClick={handleCopyToMyAssignments}
      >
        내 과제로 복사하기
      </Button>
    </div>
  </AssignmentPreview>
</div>
```

#### 3.3 반응형 디자인
- 모바일: 카드 1열 배치, 필터 접기/펼치기
- 태블릿: 카드 2열 배치
- 데스크톱: 카드 3열 배치, 사이드바 필터

#### 3.4 상태 표시
```typescript
// 공유 상태 뱃지
{assignment.isShared && (
  <Badge className="bg-green-100 text-green-700">
    <Globe className="w-3 h-3 mr-1" />
    공유중
  </Badge>
)}

// 복사된 과제 표시
{assignment.copiedFrom && (
  <div className="text-sm text-gray-500">
    <Copy className="w-3 h-3 inline mr-1" />
    {assignment.copiedFrom} 템플릿에서 복사됨
  </div>
)}
```

### 4. API 엔드포인트

```typescript
// 과제 공유하기
POST /api/assignments/:id/share
{
  isPublic: boolean  // true: 전체 공유, false: 개별 공유
  emails?: string[]  // 개별 공유시 이메일 목록
}

// 공유 과제 목록 조회
GET /api/shared-assignments
Query params:
- gradeLevel?: string
- writingType?: string
- schoolName?: string
- search?: string
- sort?: 'latest' | 'popular'
- page?: number
- limit?: number

// 공유 과제 복사하기
POST /api/assignments/:id/copy
{
  includeSubmissions: boolean  // 제출물도 복사할지 여부
}

// 복사 동작 설명:
// 1. 새로운 Assignment 생성 (userId는 복사한 사용자)
// 2. 평가 기준과 설정만 복사
// 3. Submission과 Evaluation은 복사하지 않음 (새로운 독립적인 과제)
```

### 5. 권한 관리

```typescript
// 공유 권한 체크
function canShareAssignment(userId: string, assignment: Assignment): boolean {
  return assignment.userId === userId || user.role === 'ADMIN';
}

// 복사 권한 체크
function canCopyAssignment(assignment: Assignment): boolean {
  return assignment.isShared || hasPrivateAccess(userId, assignment.id);
}
```

### 6. 추가 기능 제안

#### 공유 통계
```prisma
model AssignmentStats {
  id            String   @id @default(cuid())
  assignmentId  String   @unique
  viewCount     Int      @default(0)
  copyCount     Int      @default(0)
  lastViewedAt  DateTime?
  
  assignment    Assignment @relation(fields: [assignmentId], references: [id])
}
```

#### 공유 태그/카테고리
```prisma
model AssignmentTag {
  id    String @id @default(cuid())
  name  String @unique
  assignments AssignmentToTag[]
}

model AssignmentToTag {
  assignmentId String
  tagId        String
  assignment   Assignment @relation(fields: [assignmentId], references: [id])
  tag          AssignmentTag @relation(fields: [tagId], references: [id])
  
  @@id([assignmentId, tagId])
}
```

### 7. 구현 우선순위

1. **Phase 1 (MVP)**
   - 전체 공유 기능 (`isShared` 활용)
   - 공유 과제 목록 페이지
   - 과제 복사 기능

2. **Phase 2**
   - 필터링 및 검색 기능
   - 공유 통계 (조회수, 복사수)
   - 태그 시스템

3. **Phase 3**
   - 개별 공유 기능
   - 공유 권한 세분화
   - 댓글/피드백 시스템

## 데이터 프라이버시 보장

### 공유 시 제외되는 정보
- 모든 학생 정보 (이름, ID, 제출물)
- 모든 평가 결과
- 개인 메모나 코멘트
- 학교별 특수 설정

### 복사 후 독립성 보장
```typescript
// 복사된 과제에서의 모든 활동은 복사한 사용자만 접근 가능
function canAccessEvaluation(userId: string, evaluation: Evaluation): boolean {
  return evaluation.userId === userId;
}

// 원본 공유자도 복사된 과제의 데이터에 접근 불가
function canViewCopiedAssignment(originalUserId: string, copiedAssignment: Assignment): boolean {
  return false; // 항상 불가
}
```

## 예상 효과

1. **교사 간 협업 증진**: 우수한 평가 기준 공유
2. **신규 교사 지원**: 샘플 과제를 통한 학습
3. **평가 품질 향상**: 다양한 평가 기준 참고
4. **커뮤니티 형성**: 교사 간 지식 공유 플랫폼
5. **프라이버시 보호**: 학생 정보와 평가 결과의 완벽한 분리

## 기술적 고려사항

1. **성능 최적화**
   - 공유 과제 목록 페이지네이션
   - 인덱스 최적화 (이미 적용됨)
   - 캐싱 전략

2. **보안**
   - 민감한 학생 정보 제거
   - 복사 시 submission 데이터 필터링
   - API 레이트 리미팅

3. **확장성**
   - 태그 시스템을 통한 유연한 분류
   - 통계 데이터 별도 테이블 관리
   - 향후 댓글/리뷰 시스템 추가 가능

## 데이터 격리 및 독립성

### 복사 시 데이터 처리 방식

1. **과제 복사 (Assignment Copy)**
   - 원본 과제의 평가 기준, 루브릭, 설정만 복사
   - 새로운 `assignmentId` 생성
   - `userId`는 복사한 사용자로 설정
   - `isShared = false`로 초기화 (복사본은 비공개)

2. **채점 데이터 격리**
   ```typescript
   // 복사된 과제는 완전히 독립적
   const copiedAssignment = {
     ...originalAssignment,
     id: generateNewId(),
     userId: currentUserId,
     isShared: false,
     sharedAt: null,
     submissions: [],      // 빈 배열로 시작
     evaluations: []       // 빈 배열로 시작
   }
   ```

3. **평가 결과 독립성**
   - 각 사용자가 복사한 과제에서의 평가는 해당 사용자만 볼 수 있음
   - 원본 공유자나 다른 복사 사용자의 평가 결과와 완전히 분리
   - `Evaluation` 테이블의 `userId` 필드로 구분

### 협업 vs 독립 사용 시나리오

#### 현재 제안 (독립 사용)
- A 교사가 과제 공유 → B 교사가 복사 → B만의 독립적인 과제로 사용
- 장점: 프라이버시 보호, 자유로운 수정
- 단점: 협업 평가 불가

#### 구체적인 사용 예시
1. **A 교사**: "6학년 논설문 평가 기준" 공유
2. **B 교사**: 해당 템플릿 복사 → 자신의 학급에 적용
   - B가 새로운 학생 추가: A는 볼 수 없음
   - B가 평가 수행: A는 볼 수 없음
   - B가 평가 기준 수정: A의 원본에 영향 없음
3. **C 교사**: 같은 템플릿 복사 → 독립적으로 사용
   - C의 모든 활동은 C만 접근 가능
   - A, B와 완전히 분리된 데이터

#### 향후 확장 가능성 (협업 모드)
```prisma
// 협업을 위한 추가 모델 (향후 고려)
model CollaborativeAssignment {
  id            String   @id @default(cuid())
  assignmentId  String   
  allowedUsers  String[] // 협업 가능한 사용자 목록
  viewMode      String   // "all" | "own" | "aggregate"
}
```

## 결론

현재 제안은 **각 사용자가 독립적으로 사용할 수 있는 샘플 공유** 방식입니다. 공유된 과제를 복사하면 완전히 새로운 과제가 되어, 각자의 학생들을 평가하는 데 사용됩니다. 

이는 quiz 앱의 카드 공유와 유사한 방식으로, 템플릿을 공유하되 실제 사용은 각자 독립적으로 하는 구조입니다. 향후 필요시 협업 평가 기능을 추가로 구현할 수 있습니다.