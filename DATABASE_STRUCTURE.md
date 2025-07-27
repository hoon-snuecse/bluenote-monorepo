# Bluenote 데이터베이스 구조 문서

## 개요

Bluenote 프로젝트는 교육 플랫폼으로 두 개의 주요 애플리케이션을 지원하는 통합 데이터베이스를 사용합니다:
- **Grading 앱**: AI 기반 에세이 평가 시스템
- **Web 앱**: 교육 콘텐츠 관리 시스템 (CMS)

### 데이터베이스 기본 정보
- **데이터베이스 엔진**: PostgreSQL 17.4 (64-bit, ARM64)
- **데이터베이스 이름**: postgres
- **현재 크기**: 13 MB
- **총 테이블 수**: 23개
- **총 컬럼 수**: 218개
- **인덱스 수**: 67개

## 데이터베이스 스키마 구조

### 1. 교육 평가 시스템 (Grading App)

#### 1.1 Student (학생 정보)
학생의 기본 정보를 저장하는 테이블입니다.

| 컬럼명 | 타입 | NULL 허용 | 기본값 | 설명 |
|--------|------|-----------|---------|------|
| id | text | NO | - | 기본 키 |
| studentId | text | NO | - | 학생 ID |
| name | text | NO | - | 학생 이름 |
| email | text | YES | - | 이메일 주소 |
| groupId | text | NO | - | 소속 그룹 ID |
| grade | text | YES | - | 학년 |
| class | text | YES | - | 반 |
| number | integer | YES | - | 번호 |
| createdAt | timestamp | NO | CURRENT_TIMESTAMP | 생성일시 |
| updatedAt | timestamp | NO | - | 수정일시 |

**현재 레코드 수**: 24개

#### 1.2 Assignment (과제 정보)
평가 과제의 세부 정보를 저장하는 테이블입니다.

| 컬럼명 | 타입 | NULL 허용 | 기본값 | 설명 |
|--------|------|-----------|---------|------|
| id | text | NO | - | 기본 키 |
| title | text | NO | - | 과제 제목 |
| schoolName | text | NO | - | 학교명 |
| gradeLevel | text | NO | - | 학년 수준 |
| writingType | text | NO | - | 글쓰기 유형 |
| evaluationDomains | jsonb | NO | - | 평가 영역 (JSON) |
| evaluationLevels | jsonb | NO | - | 평가 수준 (JSON) |
| levelCount | integer | NO | - | 수준 개수 |
| gradingCriteria | text | NO | - | 채점 기준 |
| createdAt | timestamp | NO | CURRENT_TIMESTAMP | 생성일시 |
| updatedAt | timestamp | NO | - | 수정일시 |

**현재 레코드 수**: 6개

#### 1.3 Submission (제출물)
학생들이 제출한 과제를 저장하는 테이블입니다.

| 컬럼명 | 타입 | NULL 허용 | 기본값 | 설명 |
|--------|------|-----------|---------|------|
| id | text | NO | - | 기본 키 |
| assignmentId | text | NO | - | 과제 ID |
| studentName | text | NO | - | 학생 이름 |
| studentId | text | NO | - | 학생 ID |
| content | text | NO | - | 제출 내용 |
| submittedAt | timestamp | NO | CURRENT_TIMESTAMP | 제출일시 |
| evaluatedAt | timestamp | YES | - | 평가일시 |
| evaluation | jsonb | YES | - | 평가 결과 (JSON) |
| studentDbId | text | YES | - | 학생 DB ID |
| documentPath | text | YES | - | 문서 경로 |
| sourceType | text | NO | 'MANUAL' | 소스 유형 |
| createdAt | timestamp | NO | CURRENT_TIMESTAMP | 생성일시 |
| updatedAt | timestamp | NO | - | 수정일시 |

**현재 레코드 수**: 106개 (가장 많은 데이터)

#### 1.4 Evaluation (평가 결과)
AI가 생성한 평가 결과를 저장하는 테이블입니다.

| 컬럼명 | 타입 | NULL 허용 | 기본값 | 설명 |
|--------|------|-----------|---------|------|
| id | text | NO | - | 기본 키 |
| submissionId | text | NO | - | 제출물 ID |
| assignmentId | text | NO | - | 과제 ID |
| studentId | text | NO | - | 학생 ID |
| domainEvaluations | jsonb | NO | - | 영역별 평가 (JSON) |
| overallLevel | text | NO | - | 전체 수준 |
| overallFeedback | text | NO | - | 전체 피드백 |
| improvementSuggestions | jsonb | NO | - | 개선 제안 (JSON) |
| strengths | jsonb | NO | - | 강점 (JSON) |
| evaluatedAt | timestamp | NO | CURRENT_TIMESTAMP | 평가일시 |
| evaluatedBy | text | YES | - | 평가자 |
| studentDbId | text | YES | - | 학생 DB ID |
| evaluatedByUser | text | YES | - | 평가 사용자 |

**현재 레코드 수**: 77개

#### 1.5 StudentGroup (학생 그룹)
학생들을 그룹으로 관리하기 위한 테이블입니다.

**현재 레코드 수**: 1개

### 2. 콘텐츠 관리 시스템 (Web App)

#### 2.1 Teaching Posts (교육 게시물)
교육 관련 콘텐츠를 저장하는 테이블입니다.

| 컬럼명 | 타입 | NULL 허용 | 기본값 | 설명 |
|--------|------|-----------|---------|------|
| id | integer | NO | 자동 증가 | 기본 키 |
| title | text | NO | - | 제목 |
| content | text | NO | - | 내용 |
| category | text | NO | - | 카테고리 |
| tags | ARRAY | YES | - | 태그 배열 |
| summary | text | YES | - | 요약 |
| reading_time | integer | YES | 5 | 읽기 시간(분) |
| is_ai_generated | boolean | YES | false | AI 생성 여부 |
| created_at | timestamp with tz | YES | now() | 생성일시 |
| updated_at | timestamp with tz | YES | now() | 수정일시 |

**현재 레코드 수**: 0개

#### 2.2 Research Posts (연구 게시물)
연구 관련 콘텐츠를 저장하는 테이블입니다. (구조는 teaching_posts와 동일)

**현재 레코드 수**: 3개

#### 2.3 Analytics Posts (분석 게시물)
데이터 분석 관련 콘텐츠를 저장하는 테이블입니다. (구조는 teaching_posts와 동일)

**현재 레코드 수**: 0개

#### 2.4 Shed Posts (Shed 게시물)
기타 콘텐츠를 저장하는 테이블입니다. 추가 필드 포함.

**현재 레코드 수**: 2개

### 3. 시스템 관리

#### 3.1 User (사용자)
시스템 사용자 정보를 저장하는 테이블입니다.

| 컬럼명 | 타입 | NULL 허용 | 기본값 | 설명 |
|--------|------|-----------|---------|------|
| id | text | NO | - | 기본 키 |
| email | text | NO | - | 이메일 |
| password | text | NO | - | 비밀번호 (해시) |
| name | text | NO | - | 이름 |
| role | USER-DEFINED | NO | 'TEACHER' | 역할 |
| schoolName | text | YES | - | 학교명 |
| isActive | boolean | NO | true | 활성 상태 |
| lastLoginAt | timestamp | YES | - | 마지막 로그인 |
| createdAt | timestamp | NO | CURRENT_TIMESTAMP | 생성일시 |
| updatedAt | timestamp | NO | - | 수정일시 |

**현재 레코드 수**: 0개

#### 3.2 System Settings (시스템 설정)
시스템 전반의 설정을 저장하는 테이블입니다.

**현재 레코드 수**: 1개

#### 3.3 User Permissions (사용자 권한)
사용자별 권한을 관리하는 테이블입니다.

**현재 레코드 수**: 8개

#### 3.4 Usage Logs (사용 로그)
시스템 사용 로그를 저장하는 테이블입니다.

**현재 레코드 수**: 27개

### 4. 인증 및 토큰

#### 4.1 AccessToken
API 접근 토큰을 저장하는 테이블입니다.

**현재 레코드 수**: 0개

#### 4.2 Google Tokens
Google OAuth 토큰을 저장하는 테이블입니다.

**현재 레코드 수**: 1개

## 데이터베이스 특징

### 1. 관계 구조
현재 데이터베이스에는 명시적인 외래 키 제약조건이 설정되어 있지 않습니다. 대신 애플리케이션 레벨에서 관계를 관리하고 있습니다:

- **Assignment ↔ Submission**: assignmentId로 연결
- **Student ↔ Submission**: studentId로 연결
- **Submission ↔ Evaluation**: submissionId로 연결
- **Student ↔ StudentGroup**: groupId로 연결

### 2. JSON 데이터 활용
많은 테이블에서 JSONB 타입을 사용하여 유연한 데이터 구조를 지원합니다:
- 평가 도메인 및 수준 정보
- 평가 결과 상세 내용
- 개선 제안 및 강점 목록

### 3. 타임스탬프 관리
모든 주요 테이블에는 createdAt과 updatedAt 필드가 있어 데이터 변경 이력을 추적할 수 있습니다.

### 4. 다중 앱 지원
단일 데이터베이스에서 두 개의 독립적인 애플리케이션(Grading, Web)을 지원하는 구조입니다.

## 신규 팀원을 위한 가이드

### 1. 시작하기 전에
- 이 데이터베이스는 Supabase에서 호스팅됩니다
- PostgreSQL 17.4를 사용하므로 해당 버전의 기능을 활용할 수 있습니다
- 대부분의 관계는 애플리케이션 레벨에서 관리됩니다

### 2. 주요 작업 패턴

#### 학생 과제 제출 플로우
1. Assignment 생성 → 과제 정보 저장
2. Student 확인 → 학생 정보 확인/생성
3. Submission 생성 → 학생의 과제 제출
4. Evaluation 생성 → AI 평가 결과 저장

#### 콘텐츠 관리 플로우
1. 적절한 posts 테이블 선택 (teaching, research, analytics, shed)
2. 콘텐츠 생성 및 태그 지정
3. 필요시 이미지 테이블에 관련 이미지 저장

### 3. 성능 고려사항
- 67개의 인덱스가 설정되어 있어 검색 성능이 최적화되어 있습니다
- JSONB 필드는 인덱싱이 가능하므로 필요시 추가 인덱스를 생성할 수 있습니다
- 현재 데이터베이스 크기가 13MB로 작은 편이지만, 향후 증가를 고려한 설계가 필요합니다

### 4. 보안 고려사항
- 비밀번호는 해시 형태로 저장됩니다
- 토큰 정보는 별도 테이블에서 관리됩니다
- 사용자 권한은 user_permissions 테이블에서 세밀하게 관리됩니다

## 추가 리소스
- Supabase 프로젝트 URL: https://ukxchcyvxnbmsfrsamjk.supabase.co
- 각 앱별 상세 문서는 다음을 참조하세요:
  - `apps/grading/CLAUDE.md`: Grading 시스템 상세 가이드
  - `apps/web/CLAUDE.md`: Web CMS 시스템 상세 가이드