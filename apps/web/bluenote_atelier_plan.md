# BlueNote Atelier 전체 계획서

## 🎯 프로젝트 개요

### 사이트 정체성
- **이름**: BlueNote Atelier
- **슬로건**: "Where Ideas Come to Life" (아이디어가 살아나는 곳)
- **성격**: 연구자이자 장인의 창작 공간 - 학문적 엄밀함과 개인적 따뜻함의 조화
- **철학**: 현실에 뿌리를 둔 이론, 원칙이 있는 실천

## 🗂️ 사이트 구조

### 메인 메뉴 구성
```
🏠 홈 (Home)
🔬 연구 (Research)  
👨‍🏫 교육 (Teaching)
📊 분석 (Analytics)
🏠 창고 (Shed)
```

### GitHub 저장 구조
```
data/
├── research/           # 연구 포스트
├── teaching/           # 교육 포스트  
├── analytics/          # 분석 포스트
├── shed/               # 창고 콘텐츠 (목공, 사진, 커피, 양조, 여행 통합)
└── media/              # 이미지, 동영상 파일
```

### 라우팅 구조
```
/                       # 홈페이지
/research              # 연구 메인
/teaching              # 교육 메인  
/analytics             # 분석 메인
/shed                  # 창고 메인

// 향후 확장시 세분화
/research/my-work      # 내 작업
/research/data-stories # 데이터 이야기
/analytics/dashboard   # 대시보드
/shed/woodworking     # 목공
/shed/photography     # 사진
// 등등...
```

## 🛠️ 기술 스택

### 핵심 기술
- **프론트엔드**: Next.js 15 + React 19 + Tailwind CSS
- **백엔드**: Next.js API Routes
- **배포**: Vercel
- **콘텐츠 관리**: GitHub Repository
- **AI 통합**: Claude AI + MCP (Model Context Protocol)

### 추가 기능
- **SNA 분석**: NetworkX (Python) + Plotly (시각화)
- **데이터 처리**: 백그라운드 processing
- **실시간 업데이트**: GitHub webhooks + Vercel 자동 배포

### MCP 도구 구성
```python
# bluenote_atelier_mcp.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("BlueNote Atelier")

@mcp.tool()
def create_research_post(title: str, content: str) -> str:
    """연구 포스트 업로드"""

@mcp.tool()
def create_teaching_post(title: str, content: str) -> str:
    """교육 포스트 업로드"""

@mcp.tool()
def create_analytics_post(title: str, content: str) -> str:
    """분석 포스트 업로드"""

@mcp.tool()
def create_shed_post(title: str, content: str, images: list = None) -> str:
    """창고 활동 기록 (목공, 사진, 커피, 양조, 여행 통합)"""

@mcp.tool()
def analyze_and_publish(raw_data: str, analysis_type: str) -> str:
    """데이터 분석 후 자동으로 BlueNote에 게시"""
```

## 💭 콘텐츠 전략

### 개장 메시지
> **"BlueNote Atelier에 오신 것을 환영합니다!"**
> 
> 이곳은 **미완성된 생각들이 살아 숨쉬는 공간**입니다.
> 
> 우리는 완벽한 답 대신 **더 나은 질문을 만들어갑니다**. 철학자들이 연구 노트에 불완전한 아이디어를 기록하듯, 건축가들이 청사진에 미래의 건물을 그려내듯, 지향점을 가지고 **미래를 그려나갑니다**.

### 마음에 남은 글귀

**"There is nothing so practical as a good theory."**  
"좋은 이론만큼 실용적인 것은 없다."  
**출처**: Lewin, K. (1951). Field Theory in Social Science: Selected Theoretical Papers. New York: Harper

**"Knowledge emerges only through invention and re-invention, through the restless, impatient, continuing, hopeful inquiry human beings pursue in the world, with the world, and with each other."**  
"지식은 발명과 재발명을 통해, 인간이 세상에서, 세상과 함께, 서로와 함께 추구하는 끊임없고 조급하고 지속적이고 희망적인 탐구를 통해서만 생겨난다."  
**출처**: Freire, Paulo (2014). Pedagogy of the Oppressed: 30th Anniversary Edition. Bloomsbury Publishing USA

**"Education is the most powerful weapon which you can use to change the world."**  
"교육은 세상을 바꾸는 데 사용할 수 있는 가장 강력한 무기이다."  
**출처**: Mandela, N.R. (1994). Long Walk to Freedom. London: Abacus

### 콘텐츠 유형별 분류

#### 연구 (Research)
- 교육평가, 연구방법론 프로젝트
- SNA 분석 결과
- 논문 요약 및 리뷰
- 방법론 노트

#### 교육 (Teaching)
- 개인적 교육 철학
- 수업 경험과 인사이트
- 교육 현장 관찰

#### 분석 (Analytics)
- 데이터 분석 결과
- 시각화 작품
- 분석 도구 리뷰
- 코드 스니펫

#### 창고 (Shed)
- **목공**: 프로젝트 과정, 도구 소개, 작품 갤러리
- **사진**: 여행 사진, 촬영 기법, 장비 리뷰
- **커피**: 월간 로스팅 노트, 원두 특성, 추출법
- **양조**: 술 만들기 실험, 레시피, 시음 노트
- **여행**: 여행 에세이, 문화 관찰, 여행 팁

## 🎨 디자인 가이드라인

### 컬러 팔레트
```css
--blueprint-primary: #1e3a8a;    /* 청사진 파란색 */
--blueprint-secondary: #3b82f6;  /* 밝은 파란색 */
--blueprint-accent: #fbbf24;     /* 하이라이터 노란색 */
--blueprint-paper: #f8fafc;     /* 종이 흰색 */
--blueprint-lines: #e2e8f0;     /* 격자선 회색 */
```

### 디자인 컨셉
- 연구 노트/청사진 느낌
- 깔끔하고 전문적이면서 친근함
- 손으로 그린 듯한 스케치 요소
- 모바일 반응형

### 네비게이션 컴포넌트
```jsx
const navigationItems = [
  { label: '홈', route: 'home', icon: '🏠' },
  { label: '연구', route: 'research', icon: '🔬' },
  { label: '교육', route: 'teaching', icon: '👨‍🏫' },
  { label: '분석', route: 'analytics', icon: '📊' },
  { label: '창고', route: 'shed', icon: '🏠' }
];
```

## 🚀 개발 로드맵

### Phase 1: 기본 구조 (4주)
**목표**: 사이트 골격 완성
- [ ] Next.js 프로젝트 초기 설정
- [ ] 5개 메인 섹션 페이지 생성
- [ ] 기본 디자인 시스템 구축
- [ ] GitHub Repository 설정
- [ ] Vercel 배포 환경 구성
- [ ] 기본 라우팅 구조 완성

### Phase 2: 콘텐츠 시스템 (4주)
**목표**: 콘텐츠 관리 및 업로드 시스템
- [ ] GitHub 기반 콘텐츠 관리 시스템
- [ ] MCP 서버 개발 및 Claude 연동
- [ ] 마크다운 렌더링 시스템
- [ ] 이미지 및 미디어 관리
- [ ] 검색 기능 구현
- [ ] 반응형 UI 완성

### Phase 3: SNA 기능 통합 (8주)
**목표**: 사회네트워크분석 도구 통합
- [ ] NetworkX 기반 분석 엔진 구축
- [ ] Python-JavaScript 연동 시스템
- [ ] Plotly 시각화 컴포넌트
- [ ] 인터랙티브 대시보드
- [ ] 분석 결과 자동 저장 시스템
- [ ] 백그라운드 처리 최적화

### Phase 4: 고도화 및 확장 (지속적)
**목표**: 사용자 경험 개선 및 기능 확장
- [ ] 섹션별 세분화 (필요시)
- [ ] 고급 분석 기능 추가
- [ ] 성능 최적화
- [ ] SEO 최적화
- [ ] 접근성 개선
- [ ] 다국어 지원 (필요시)

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- Python 3.9+
- Git
- Claude Desktop App

### 환경 변수
```env
# .env.local
CLAUDE_API_KEY=your-claude-api-key
GITHUB_TOKEN=your-github-token
GITHUB_REPO=your-username/bluenote-data
NEXT_PUBLIC_APP_URL=https://your-bluenote-domain.com
```

### 패키지 의존성
```json
{
  "dependencies": {
    "next": "15.0.0",
    "react": "19.0.0",
    "tailwindcss": "^3.4.0",
    "plotly.js": "^2.26.0",
    "gray-matter": "^4.0.3",
    "remark": "^15.0.1",
    "remark-html": "^16.0.1"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

### MCP 설정
```json
// claude_desktop_config.json
{
  "mcpServers": {
    "bluenote-atelier": {
      "command": "python",
      "args": ["bluenote_atelier_mcp.py"],
      "env": {
        "GITHUB_TOKEN": "your-token"
      }
    }
  }
}
```

## 📞 연락처 및 지원

### 연락 방법
- **이메일**: hoon@snuecse.org
- **GitHub**: Repository Issues
- **방문자 댓글**: 제공하지 않음 (의도적 설계)

### 지원되는 기능
- ✅ 이메일을 통한 피드백
- ✅ GitHub을 통한 기술적 문의
- ✅ 연구 협력 제안
- ❌ 실시간 채팅
- ❌ 댓글 시스템

## 📋 참고사항

### 라이선스
- MIT License (코드)
- Creative Commons (콘텐츠)

### 브라우저 지원
- Chrome/Edge (최신 2개 버전)
- Firefox (최신 2개 버전)
- Safari (최신 2개 버전)
- 모바일 브라우저 완전 지원

### 성능 목표
- **페이지 로드**: < 3초
- **이미지 최적화**: WebP 형식
- **번들 크기**: < 500KB (초기 로드)
- **Lighthouse 점수**: 90+ (모든 카테고리)

---

**최종 목표**: 연구자의 전문성과 장인의 손끝 감각이 어우러진, 이론과 실천이 만나는 창조적 교육연구 생태계 구축