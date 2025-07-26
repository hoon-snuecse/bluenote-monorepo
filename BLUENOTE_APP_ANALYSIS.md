# Bluenote 앱 분석 보고서

## 개요
bluenote 앱은 초기 버전의 BlueNote Atelier로, 현재 web 앱과 많은 기능이 중복되어 있습니다.

## 주요 발견사항

### 1. 기본 정보
- **패키지명**: `my-claude-app` (초기 개발 시 사용한 이름)
- **프레임워크**: Next.js 15.3.4
- **총 파일 수**: 74개 (node_modules 제외)
- **주요 기능**: CMS, Claude AI 통합, 인증, 관리자 대시보드

### 2. Web 앱과의 차이점

#### bluenote 앱에만 있는 것
- `/app/activities/` - 활동 관련 페이지들
- `/app/prg/` - 프로그램 목록 페이지 (계산기, 웹 도구 등)
- 일부 레거시 페이지 구조

#### web 앱에만 있는 것
- `/app/admin/analytics/` - 고급 통계 대시보드
- `/app/admin/content/` - 콘텐츠 관리
- `/app/admin/settings/` - 설정 관리
- 더 체계적인 API 구조

### 3. 중복 기능
- 인증 시스템 (NextAuth)
- CMS 기능 (research, teaching, analytics, shed)
- Claude AI 통합
- 관리자 대시보드 (기본 버전)
- Supabase 통합

### 4. 현재 사용 여부
- **프로덕션 도메인**: bluenote.site는 현재 이 앱을 가리키고 있음
- **grading 링크**: `/prg/grading`에서 grading.bluenote.site로 리다이렉트
- **활성 사용**: 일부 사용자가 여전히 이 앱을 통해 접속 중

## 권장사항

### Option 1: 점진적 마이그레이션 (추천)
1. **단기 (1-2주)**
   - bluenote 앱의 고유 기능 파악
   - `/activities/`, `/prg/` 등 web 앱에 없는 기능 목록화
   - 사용자 트래픽 분석

2. **중기 (1개월)**
   - 필요한 기능을 web 앱으로 이식
   - 리다이렉트 설정
   - 사용자 공지

3. **장기 (2개월)**
   - bluenote 앱 백업 후 제거
   - 도메인을 web 앱으로 완전 이전

### Option 2: 즉시 백업 및 제거
**장점**:
- 개발 복잡도 감소
- 유지보수 부담 제거
- 명확한 구조

**단점**:
- 기존 사용자 혼란
- 일부 기능 손실 가능
- URL 구조 변경

## 백업 계획

```bash
# 1. 전체 백업 생성
tar -czf bluenote-app-backup-$(date +%Y%m%d).tar.gz apps/bluenote/

# 2. 데이터베이스 내용 백업 (필요시)
# Supabase에서 bluenote 관련 테이블 export

# 3. Git 태그 생성
git tag bluenote-legacy-final
git push origin bluenote-legacy-final

# 4. 별도 브랜치로 보관
git checkout -b archive/bluenote-legacy
git push origin archive/bluenote-legacy
```

## 마이그레이션 체크리스트

### 필수 이전 항목
- [ ] `/activities/` 페이지들
- [ ] `/prg/` 프로그램 목록
- [ ] 고유한 UI 컴포넌트
- [ ] 특별한 설정이나 환경변수

### 확인 필요 항목
- [ ] 사용자 데이터 호환성
- [ ] URL 구조 매핑
- [ ] SEO 영향
- [ ] 외부 링크 참조

## 결론

bluenote 앱은 web 앱의 프로토타입 역할을 했으며, 현재는 대부분의 기능이 web 앱에서 더 나은 형태로 구현되어 있습니다. 

**추천 방향**:
1. 점진적 마이그레이션을 통해 사용자 영향 최소화
2. 고유 기능만 선별적으로 이전
3. 2개월 내 완전 제거 목표

이렇게 하면 코드베이스가 단순해지고, 유지보수가 쉬워지며, 개발 효율성이 향상될 것입니다.