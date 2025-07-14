# Claude AI 웹 애플리케이션 구축 완전 가이드

## 🎯 프로젝트 개요

이 가이드는 **Claude AI를 활용한 콘텐츠 관리 웹 애플리케이션**을 처음부터 완성까지 구축하는 전체 과정을 다룹니다. 

**최종 결과물**: https://my-claude-app-six.vercel.app/

**주요 기능**:
- Claude AI를 통한 콘텐츠 자동 생성
- 생성된 콘텐츠 편집 및 관리
- GitHub을 통한 데이터 저장
- Vercel을 통한 자동 배포

---

## 🗺️ 개발 과정 이해하기

웹 애플리케이션을 만든다는 것은 **디지털 서비스를 세상에 내놓는 일**입니다. 마치 실제 가게를 차리는 것과 비슷한 과정을 거칩니다.

### 📋 **1단계: 개발 환경 준비** - "작업장 마련하기"

**🤔 왜 필요한가요?**
- 요리를 하려면 주방이 필요하듯, 프로그래밍을 하려면 개발 도구가 필요합니다
- 컴퓨터에 "개발자 도구"를 설치하는 과정입니다

**🔧 무엇을 하나요?**
- **Node.js**: JavaScript로 서버를 만들 수 있게 해주는 도구
- **Git**: 코드의 변경사항을 기록하고 관리하는 도구 (마치 문서의 버전 관리)
- **VS Code**: 코드를 편집하는 텍스트 에디터 (워드프로세서 같은 것)

**💡 비유하자면**: 목수가 톱, 망치, 자를 준비하는 것과 같습니다.

---

### 🏗️ **2단계: 프로젝트 초기 설정** - "건물의 기초 다지기"

**🤔 왜 필요한가요?**
- 웹사이트의 기본 뼈대를 만드는 과정입니다
- 나중에 기능을 추가할 때 흔들리지 않는 튼튼한 기반을 마련합니다

**🔧 무엇을 하나요?**
- **Next.js 프로젝트 생성**: 웹사이트의 기본 틀을 만듭니다
- **필요한 라이브러리 설치**: 미리 만들어진 유용한 기능들을 가져옵니다
- **폴더 구조 설계**: 파일들을 정리정돈할 방법을 정합니다

**💡 비유하자면**: 집을 지을 때 설계도를 그리고 기초 공사를 하는 것과 같습니다.

**🔍 구체적인 예시**:
```
내 프로젝트/
├── 페이지들/          # 사용자가 보는 화면들
├── API/              # 서버 기능들  
├── 컴포넌트/          # 재사용되는 UI 조각들
└── 스타일/           # 디자인 파일들
```

---

### 🤖 **3단계: Claude AI 통합** - "똑똑한 직원 고용하기"

**🤔 왜 필요한가요?**
- 사용자가 요청하면 Claude AI가 자동으로 글을 써주는 기능을 만듭니다
- 마치 24시간 일하는 글쓰기 전문가를 고용하는 것과 같습니다

**🔧 무엇을 하나요?**
- **API 연결**: Claude AI 서비스와 우리 웹사이트를 연결합니다
- **요청/응답 처리**: 사용자 입력을 Claude에게 전달하고 답변을 받아옵니다
- **에러 처리**: 문제가 생겼을 때 적절히 대응합니다

**💡 비유하자면**: 
- 카페에서 "아메리카노 주세요"라고 주문하면
- 바리스타가 커피를 만들어서 
- "여기 아메리카노입니다"라고 전달하는 과정과 같습니다

**🔍 실제 동작**:
```
사용자: "AI에 대한 글을 써줘" 
    ↓
웹사이트: Claude에게 요청 전달
    ↓  
Claude: "AI는 인공지능으로..." (글 생성)
    ↓
웹사이트: 생성된 글을 사용자에게 표시
```

---

### 🎨 **4단계: UI/UX 구현** - "가게 인테리어 꾸미기"

**🤔 왜 필요한가요?**
- 사용자가 쉽고 예쁘게 사용할 수 있는 화면을 만듭니다
- 아무리 좋은 기능이 있어도 사용하기 어려우면 의미가 없습니다

**🔧 무엇을 하나요?**
- **페이지 디자인**: 버튼, 입력창, 텍스트 등의 배치를 정합니다
- **반응형 디자인**: 컴퓨터, 태블릿, 스마트폰에서 모두 잘 보이게 만듭니다
- **사용자 경험**: 클릭하면 어떻게 되는지, 로딩 중일 때는 어떻게 표시할지 정합니다

**💡 비유하자면**: 
- 카페를 열 때 테이블, 의자, 메뉴판을 어디에 둘지 정하고
- 손님이 편하게 주문할 수 있도록 동선을 설계하는 것과 같습니다

**🔍 실제 구현**:
- **입력창**: "어떤 글을 쓸까요?"
- **버튼**: "글 생성하기"
- **결과창**: 생성된 글이 나타나는 곳
- **편집 기능**: 글을 수정할 수 있는 기능

---

### 💾 **5단계: 데이터 저장 시스템** - "창고 시스템 만들기"

**🤔 왜 필요한가요?**
- 생성된 콘텐츠를 저장해두지 않으면 페이지를 새로고침할 때 사라집니다
- 나중에 다시 찾아볼 수 있도록 안전하게 보관해야 합니다

**🔧 무엇을 하나요?**
- **GitHub을 데이터베이스로 활용**: 무료이면서 안전한 저장소를 사용합니다
- **저장 형식 설계**: 데이터를 어떤 구조로 저장할지 정합니다
- **불러오기 기능**: 저장된 데이터를 다시 가져오는 기능을 만듭니다

**💡 비유하자면**:
- 도서관에서 책을 체계적으로 분류하고 저장하는 것과 같습니다
- 나중에 찾기 쉽도록 번호를 매기고 목록을 만듭니다

**🔍 저장되는 정보**:
```json
{
  "id": "20241225001",
  "제목": "AI의 미래",
  "내용": "인공지능은 우리 삶을...",
  "생성일": "2024-12-25 10:30:00"
}
```

---

### 🚀 **6단계: 배포 및 환경변수 설정** - "가게 오픈하기"

**🤔 왜 필요한가요?**
- 지금까지는 내 컴퓨터에서만 작동했습니다
- 다른 사람들도 사용할 수 있도록 인터넷에 올려야 합니다

**🔧 무엇을 하나요?**
- **코드를 GitHub에 업로드**: 내 작업을 온라인에 백업합니다
- **Vercel로 배포**: 누구나 접속할 수 있는 웹주소를 만듭니다
- **환경변수 설정**: API 키 같은 민감한 정보를 안전하게 관리합니다

**💡 비유하자면**:
- 집에서 연습하던 요리를 실제 음식점에서 손님들에게 판매하는 것과 같습니다
- 주소(도메인), 간판(웹사이트), 영업시간(서버 운영) 등을 정해야 합니다

**🔍 실제 과정**:
```
내 컴퓨터 → GitHub → Vercel → 인터넷 웹사이트
(개발)     (저장)   (배포)   (사용자 접근)
```

---

### 🔧 **7단계: 문제해결 및 디버깅** - "문제 해결하고 개선하기"

**🤔 왜 필요한가요?**
- 프로그램에는 항상 예상치 못한 문제가 발생합니다
- 사용자들이 편하게 사용할 수 있도록 지속적으로 개선해야 합니다

**🔧 무엇을 하나요?**
- **오류 찾기**: 어디서 문제가 생겼는지 추적합니다
- **로그 확인**: 프로그램이 남긴 기록을 분석합니다
- **성능 최적화**: 더 빠르고 효율적으로 작동하도록 개선합니다

**💡 비유하자면**:
- 음식점을 운영하면서 손님의 불만사항을 듣고
- 메뉴를 개선하고, 서비스를 업그레이드하는 것과 같습니다

**🔍 일반적인 문제들**:
- "API 키를 찾을 수 없습니다" → 환경변수 설정 확인
- "응답이 너무 느려요" → 캐싱 시스템 도입
- "모바일에서 깨져 보여요" → 반응형 디자인 수정

---

## 🎯 **전체 흐름 요약**

**1. 준비 단계** (도구 설치)
→ **2. 기반 구축** (프로젝트 틀 만들기)  
→ **3. 핵심 기능** (AI 연동)
→ **4. 사용자 인터페이스** (화면 만들기)
→ **5. 데이터 관리** (저장/불러오기)
→ **6. 서비스 오픈** (배포)
→ **7. 운영/개선** (문제해결)

**💡 핵심 이해**:
- 각 단계는 **순서대로** 진행해야 합니다
- 앞 단계가 제대로 되어야 다음 단계가 가능합니다
- 문제가 생기면 **이전 단계로 돌아가서** 확인해야 합니다

이제 본격적인 개발 과정을 시작해봅시다! 🚀

---

## 📋 목차

1. [개발 환경 준비](#1-개발-환경-준비)
2. [프로젝트 초기 설정](#2-프로젝트-초기-설정)
3. [Claude AI 통합](#3-claude-ai-통합)
4. [UI/UX 구현](#4-uiux-구현)
5. [데이터 저장 시스템](#5-데이터-저장-시스템)
6. [배포 및 환경변수 설정](#6-배포-및-환경변수-설정)
7. [문제해결 및 디버깅](#7-문제해결-및-디버깅)

**부록**:
- [A. Git 명령어 완전 정리](#부록-a-git-명령어-완전-정리)
- [B. API 키 관리 가이드](#부록-b-api-키-관리-가이드)

---

## 1. 개발 환경 준비

### 1.1 필수 도구 설치

```bash
# Node.js 설치 확인
node --version
npm --version

# Git 설치 확인
git --version
```

**필요한 계정**:
- [GitHub](https://github.com) - 코드 저장소
- [Vercel](https://vercel.com) - 웹 배포 서비스
- [Anthropic](https://console.anthropic.com) - Claude AI API

### 1.2 로컬 개발 환경 설정

```bash
# 프로젝트 디렉토리 생성
mkdir my-claude-app
cd my-claude-app

# Next.js 프로젝트 초기화
npx create-next-app@latest . --typescript --tailwind --eslint --app
```

**주요 선택 사항**:
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ ESLint
- ✅ App Router

---

## 2. 프로젝트 초기 설정

### 2.1 패키지 설치

```bash
# 필수 의존성 설치
npm install @anthropic-ai/sdk
npm install @octokit/rest
npm install lucide-react

# 개발 의존성
npm install --save-dev @types/node
```

**패키지 역할**:
- `@anthropic-ai/sdk`: Claude AI API 통신
- `@octokit/rest`: GitHub API 연동
- `lucide-react`: 아이콘 컴포넌트
- `@types/node`: TypeScript 타입 정의

### 2.2 프로젝트 구조 설계

```
my-claude-app/
├── app/                    # Next.js App Router
│   ├── admin/             # 관리자 페이지
│   ├── api/               # API 라우트
│   ├── components/        # 재사용 컴포넌트
│   └── globals.css        # 전역 스타일
├── data/                  # 데이터 파일
├── public/                # 정적 파일
└── package.json           # 프로젝트 설정
```

### 2.3 환경변수 설정

`.env.local` 파일 생성:

```env
# Claude AI API 키
ANTHROPIC_API_KEY=your_claude_api_key_here

# GitHub 토큰 (나중에 Vercel에서 설정)
GITHUB_TOKEN=your_github_token_here
```

---

## 3. Claude AI 통합

### 3.1 API 클라이언트 설정

`lib/anthropic.ts` 파일 생성:

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateContent(prompt: string) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    });
    
    return message.content[0].text;
  } catch (error) {
    console.error('Claude API 오류:', error);
    throw error;
  }
}
```

### 3.2 API 라우트 구현

`app/api/generate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: '프롬프트가 필요합니다.' },
        { status: 400 }
      );
    }

    const content = await generateContent(prompt);
    
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      { error: '콘텐츠 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
```

**핵심 개념**:
- **API 라우트**: 서버 사이드에서 실행되는 함수
- **환경변수**: 민감한 정보 보호
- **에러 핸들링**: 사용자에게 적절한 피드백

---

## 4. UI/UX 구현

### 4.1 메인 페이지 구성

`app/page.tsx`:

```typescript
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            박교수의 연구실
          </h1>
          <p className="text-xl text-gray-600">
            AI와 함께하는 교육연구
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Link
            href="/admin"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            콘텐츠 관리자
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### 4.2 관리자 페이지 구현

`app/admin/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { PlusCircle, Save } from 'lucide-react';

export default function AdminPage() {
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const generateContent = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      setContent(data.content);
    } catch (error) {
      console.error('생성 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">콘텐츠 관리자</h1>
        
        {/* 콘텐츠 생성 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">새 콘텐츠 생성</h2>
          
          <div className="space-y-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="생성할 콘텐츠 주제를 입력하세요..."
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            
            <button
              onClick={generateContent}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              <PlusCircle className="w-4 h-4" />
              {loading ? '생성 중...' : '콘텐츠 생성'}
            </button>
          </div>
        </div>

        {/* 생성된 콘텐츠 편집 */}
        {content && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">생성된 콘텐츠</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-lg"
            />
            <button className="mt-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              <Save className="w-4 h-4" />
              저장
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

**UI/UX 핵심 원칙**:
- **직관적 인터페이스**: 사용자가 쉽게 이해할 수 있는 구조
- **반응형 디자인**: 다양한 화면 크기 대응
- **로딩 상태**: 사용자에게 진행 상황 표시
- **에러 처리**: 문제 발생 시 적절한 안내

---

## 5. 데이터 저장 시스템

### 5.1 GitHub API 연동

`lib/github.ts`:

```typescript
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function saveToGitHub(filename: string, content: any) {
  try {
    const owner = 'your-username';
    const repo = 'your-repo';
    const path = `data/${filename}`;
    
    // 파일 존재 여부 확인
    let sha;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });
      sha = Array.isArray(data) ? data[0].sha : data.sha;
    } catch (error) {
      // 파일이 없는 경우
    }

    // 파일 업데이트 또는 생성
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Update ${filename}`,
      content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
      sha,
    });

    return { success: true };
  } catch (error) {
    console.error('GitHub 저장 오류:', error);
    throw error;
  }
}
```

### 5.2 저장 API 구현

`app/api/save/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { saveToGitHub } from '@/lib/github';

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();
    
    const data = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
    };

    await saveToGitHub(`content-${data.id}.json`, data);
    
    return NextResponse.json({ 
      success: true, 
      message: '콘텐츠가 성공적으로 저장되었습니다.' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: '저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
```

**데이터 저장 전략**:
- **GitHub을 데이터베이스로 활용**: 무료이며 버전 관리 가능
- **JSON 형태 저장**: 구조화된 데이터 관리
- **고유 ID 생성**: 데이터 식별 및 관리

---

## 6. 배포 및 환경변수 설정

### 6.1 GitHub 저장소 연결

```bash
# Git 초기화
git init

# 첫 번째 커밋
git add .
git commit -m "Initial commit: Claude AI 웹 애플리케이션"

# GitHub 저장소 연결
git remote add origin https://github.com/username/my-claude-app.git
git push -u origin main
```

### 6.2 Vercel 배포

1. **Vercel 대시보드 접속**: https://vercel.com/dashboard
2. **New Project** 클릭
3. **GitHub 저장소 선택**
4. **Deploy** 클릭

### 6.3 환경변수 설정

**Vercel 대시보드에서**:
1. 프로젝트 선택 → **Settings** → **Environment Variables**
2. 다음 변수들 추가:

```
ANTHROPIC_API_KEY = your_claude_api_key
GITHUB_TOKEN = your_github_personal_access_token
```

### 6.4 GitHub Personal Access Token 생성

1. **GitHub 설정**: 프로필 → Settings → Developer settings
2. **Personal access tokens** → **Tokens (classic)**
3. **Generate new token (classic)**
4. **권한 설정**:
   - ✅ repo (전체 저장소 접근)
   - ✅ workflow (필요시)
5. **토큰 복사** 후 Vercel 환경변수에 추가

---

## 7. 문제해결 및 디버깅

### 7.1 자주 발생하는 오류

**1. API 키 오류**
```
Error: API key not found
```
**해결**: 환경변수가 올바르게 설정되었는지 확인

**2. GitHub 토큰 오류**
```
저장 오류: GitHub 토큰이 설정되지 않았습니다
```
**해결**: Vercel 환경변수에 GITHUB_TOKEN 추가 후 재배포

**3. CORS 오류**
```
Access to fetch blocked by CORS policy
```
**해결**: API 라우트 사용 (외부 API 직접 호출 금지)

### 7.2 디버깅 방법

**1. 로그 확인**
```typescript
console.log('API 호출 데이터:', data);
console.error('오류 발생:', error);
```

**2. Vercel 함수 로그**
- Vercel 대시보드 → Functions → 로그 확인

**3. 네트워크 탭**
- 브라우저 개발자 도구 → Network 탭에서 API 호출 확인

### 7.3 성능 최적화

**1. 이미지 최적화**
```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="로고"
  width={200}
  height={100}
  priority
/>
```

**2. 코드 분할**
```typescript
import dynamic from 'next/dynamic';

const AdminPanel = dynamic(() => import('./AdminPanel'), {
  loading: () => <p>로딩 중...</p>
});
```

---

## 🎉 프로젝트 완성

**최종 확인 사항**:
- ✅ 웹사이트 정상 접근
- ✅ Claude AI 콘텐츠 생성 작동
- ✅ 콘텐츠 편집 기능
- ✅ GitHub 저장 시스템
- ✅ 반응형 디자인

**다음 단계**:
- 사용자 인증 추가
- 콘텐츠 목록 페이지
- 검색 기능
- 이미지 업로드
- 댓글 시스템

---

# 부록 A: Git 명령어 완전 정리

## A.1 기본 개념

**Git**은 분산 버전 관리 시스템으로, 코드의 변경 사항을 추적하고 여러 사람이 협업할 수 있게 해줍니다.

**핵심 개념**:
- **Repository (저장소)**: 프로젝트가 저장되는 공간
- **Commit**: 변경사항을 저장하는 단위
- **Branch**: 독립적인 작업 공간
- **Merge**: 브랜치를 합치는 작업

## A.2 초기 설정

```bash
# Git 사용자 정보 설정
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 설정 확인
git config --list

# 특정 설정 확인
git config user.name
git config user.email
```

## A.3 저장소 관리

```bash
# 새 저장소 초기화
git init

# 원격 저장소 복제
git clone https://github.com/username/repository.git

# 원격 저장소 연결
git remote add origin https://github.com/username/repository.git

# 원격 저장소 확인
git remote -v

# 원격 저장소 변경
git remote set-url origin https://github.com/username/new-repository.git
```

## A.4 기본 워크플로우

```bash
# 1. 작업 상태 확인
git status

# 2. 변경사항 확인
git diff                    # 수정된 내용 확인
git diff --staged          # 스테이지된 내용 확인

# 3. 파일 스테이징
git add filename.txt       # 특정 파일
git add .                  # 모든 변경사항
git add *.js              # 특정 패턴 파일들

# 4. 커밋 생성
git commit -m "커밋 메시지"
git commit -am "수정된 파일 자동 스테이징 + 커밋"

# 5. 원격 저장소로 푸시
git push origin main
git push -u origin main    # 첫 번째 푸시 (upstream 설정)
```

## A.5 브랜치 관리

```bash
# 브랜치 목록 확인
git branch                 # 로컬 브랜치
git branch -r             # 원격 브랜치
git branch -a             # 모든 브랜치

# 새 브랜치 생성
git branch feature-branch
git checkout -b feature-branch    # 생성 + 이동

# 브랜치 이동
git checkout main
git switch feature-branch         # 최신 명령어

# 브랜치 삭제
git branch -d feature-branch      # 병합된 브랜치
git branch -D feature-branch      # 강제 삭제
```

## A.6 병합과 리베이스

```bash
# 브랜치 병합
git checkout main
git merge feature-branch

# 리베이스 (히스토리를 깔끔하게)
git checkout feature-branch
git rebase main

# 충돌 해결 후
git add .
git rebase --continue

# 리베이스 취소
git rebase --abort
```

## A.7 히스토리 관리

```bash
# 커밋 로그 확인
git log                    # 전체 로그
git log --oneline         # 한 줄로 요약
git log --graph           # 그래프로 표시
git log -p               # 변경사항 포함

# 특정 파일 히스토리
git log filename.txt

# 커밋 간 차이 확인
git diff commit1 commit2

# 특정 커밋으로 이동 (읽기 전용)
git checkout commit-hash

# 이전 상태로 되돌리기
git reset --soft HEAD~1   # 커밋만 취소
git reset --mixed HEAD~1  # 커밋 + 스테이징 취소
git reset --hard HEAD~1   # 모든 변경사항 취소

# 특정 커밋 되돌리기 (새 커밋 생성)
git revert commit-hash
```

## A.8 스테이시(임시 저장)

```bash
# 현재 작업 임시 저장
git stash
git stash push -m "작업 중인 기능"

# 스테이시 목록 확인
git stash list

# 스테이시 적용
git stash pop              # 최신 스테이시 적용 + 삭제
git stash apply           # 적용만 (삭제 안함)
git stash apply stash@{1} # 특정 스테이시 적용

# 스테이시 삭제
git stash drop stash@{0}
git stash clear           # 모든 스테이시 삭제
```

## A.9 원격 저장소 작업

```bash
# 원격 변경사항 가져오기
git fetch origin          # 가져오기만
git pull origin main      # 가져오기 + 병합

# 원격 브랜치 추적
git checkout -b local-branch origin/remote-branch

# 원격 브랜치 삭제
git push origin --delete branch-name

# 태그 관리
git tag v1.0.0            # 태그 생성
git push origin v1.0.0    # 태그 푸시
git push origin --tags    # 모든 태그 푸시
```

## A.10 실용적인 팁

**1. 유용한 별칭 설정**
```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
```

**2. .gitignore 파일**
```gitignore
# 의존성
node_modules/
*.log

# 환경 파일
.env
.env.local

# 빌드 결과
dist/
build/

# IDE 설정
.vscode/
.idea/

# OS 파일
.DS_Store
Thumbs.db
```

**3. 좋은 커밋 메시지 작성법**
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 도구나 보조 도구 변경
```

**4. 응급 상황 대처**
```bash
# 잘못된 커밋 메시지 수정
git commit --amend -m "새로운 커밋 메시지"

# 파일을 잘못 추가한 경우
git reset HEAD filename.txt

# 모든 변경사항 버리기
git checkout -- .

# 원격과 로컬 강제 동기화
git fetch origin
git reset --hard origin/main
```

---

# 부록 B: API 키 관리 가이드

## B.1 API 키 보안의 중요성

**API 키가 노출되면**:
- 무단 사용으로 인한 요금 폭탄
- 계정 탈취 위험
- 서비스 중단 가능성
- 개인정보 유출

**보안 원칙**:
- ❌ 코드에 직접 하드코딩 금지
- ❌ 공개 저장소에 업로드 금지
- ✅ 환경변수로 관리
- ✅ 정기적인 키 교체

## B.2 환경변수 설정

### 로컬 개발 환경

**1. .env.local 파일 생성**
```env
# Claude AI API 키
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx

# GitHub 개인 액세스 토큰
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# 기타 API 키들
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
DATABASE_URL=postgresql://username:password@localhost:5432/mydb
```

**2. .gitignore에 추가**
```gitignore
# 환경 파일
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

**3. 코드에서 사용**
```typescript
// Next.js 환경에서
const apiKey = process.env.ANTHROPIC_API_KEY;

// 클라이언트에서 접근 가능하게 하려면 (주의!)
const publicKey = process.env.NEXT_PUBLIC_API_KEY;
```

### 프로덕션 환경 (Vercel)

**1. Vercel 대시보드에서 설정**
```
프로젝트 선택 → Settings → Environment Variables
```

**2. 환경별 설정**
- **Development**: 개발 환경
- **Preview**: 미리보기 환경  
- **Production**: 운영 환경

**3. 배포 후 확인**
```typescript
// API 라우트에서 확인
export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response('API 키가 설정되지 않았습니다.', { status: 500 });
  }
  
  return new Response('API 키가 정상적으로 설정되었습니다.');
}
```

## B.3 주요 서비스별 API 키 관리

### Claude AI (Anthropic)

**1. API 키 생성**
- https://console.anthropic.com 접속
- Settings → API Keys
- Create Key

**2. 사용량 모니터링**
- Usage 탭에서 요금 확인
- 한도 설정으로 과금 방지

**3. 보안 설정**
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  // 추가 보안 옵션
  timeout: 30000,
  maxRetries: 3,
});
```

### GitHub Personal Access Token

**1. 토큰 생성**
- GitHub → Settings → Developer settings
- Personal access tokens → Tokens (classic)
- Generate new token (classic)

**2. 권한 설정**
```
✅ repo              # 저장소 접근
✅ workflow          # GitHub Actions
✅ write:packages    # 패키지 관리 (필요시)
✅ read:org         # 조직 정보 (필요시)
```

**3. 사용 예시**
```typescript
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: 'my-app v1.0.0',
  timeZone: 'Asia/Seoul',
});
```

### OpenAI API

**1. API 키 관리**
- https://platform.openai.com/api-keys
- 프로젝트별 키 생성 권장

**2. 사용량 제한**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID, // 선택사항
});

// 요청 제한 설정
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: "Hello!" }],
  max_tokens: 100,
  temperature: 0.7,
});
```

## B.4 API 키 보안 모범 사례

### 1. 키 교체 전략

**정기적 교체**
```bash
# 1. 새 키 생성
# 2. 환경변수 업데이트
# 3. 애플리케이션 재배포
# 4. 이전 키 비활성화
```

**응급 교체**
```bash
# 키 노출 발견 시 즉시 실행
# 1. 기존 키 즉시 비활성화
# 2. 새 키 생성 및 적용
# 3. 로그 확인 및 피해 조사
```

### 2. 접근 제어

**IP 화이트리스트** (지원하는 서비스)
```
허용 IP: 203.0.113.0/24
서버 IP: 198.51.100.5
```

**도메인 제한**
```
허용 도메인: *.yourapp.com
리퍼러 체크: https://yourapp.com/*
```

### 3. 모니터링

**사용량 알림 설정**
```typescript
// 사용량 체크 함수
export async function checkApiUsage() {
  const usage = await getCurrentUsage();
  const limit = process.env.API_USAGE_LIMIT || 1000;
  
  if (usage > limit * 0.8) {
    await sendAlert(`API 사용량이 ${usage}/${limit}에 도달했습니다.`);
  }
}
```

**로깅 시스템**
```typescript
// API 호출 로깅
export function logApiCall(endpoint: string, success: boolean, cost?: number) {
  console.log({
    timestamp: new Date().toISOString(),
    endpoint,
    success,
    cost,
    user: getCurrentUser(),
  });
}
```

### 4. 에러 처리

**API 키 오류 대응**
```typescript
export async function handleApiError(error: any) {
  if (error.status === 401) {
    // 인증 오류
    console.error('API 키가 잘못되었거나 만료되었습니다.');
    return { error: 'API 인증 실패' };
  }
  
  if (error.status === 429) {
    // 요청 한도 초과
    console.error('API 요청 한도를 초과했습니다.');
    return { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' };
  }
  
  if (error.status === 402) {
    // 결제 필요
    console.error('API 크레딧이 부족합니다.');
    return { error: '서비스 이용을 위해 결제가 필요합니다.' };
  }
  
  return { error: '서비스 오류가 발생했습니다.' };
}
```

## B.5 환경별 설정 관리

### 개발/스테이징/프로덕션 분리

**1. 환경별 파일 구성**
```
.env.development    # 개발 환경
.env.staging        # 스테이징 환경
.env.production     # 프로덕션 환경
```

**2. 설정값 예시**
```env
# .env.development
ANTHROPIC_API_KEY=sk-ant-dev-xxxxx
API_BASE_URL=https://api-dev.yourapp.com
LOG_LEVEL=debug

# .env.production
ANTHROPIC_API_KEY=sk-ant-prod-xxxxx
API_BASE_URL=https://api.yourapp.com
LOG_LEVEL=error
```

**3. 코드에서 환경 구분**
```typescript
const config = {
  development: {
    apiTimeout: 30000,
    retryCount: 1,
    logLevel: 'debug',
  },
  production: {
    apiTimeout: 10000,
    retryCount: 3,
    logLevel: 'error',
  },
};

const env = process.env.NODE_ENV || 'development';
const currentConfig = config[env];
```

## B.6 비상 계획

### 1. API 키 노출 시 대응

**즉시 실행**
```bash
# 1. 노출된 키 비활성화
# 2. 새 키 생성
# 3. 환경변수 업데이트
# 4. 서비스 재배포
```

**피해 확인**
```typescript
// 사용량 급증 모니터링
export async function checkSuspiciousActivity() {
  const recentUsage = await getUsageLastHour();
  const normalUsage = await getAverageUsage();
  
  if (recentUsage > normalUsage * 3) {
    await sendUrgentAlert('비정상적인 API 사용량 감지');
  }
}
```

### 2. 백업 계획

**다중 제공업체**
```typescript
// 백업 API 설정
const apiClients = {
  primary: new AnthropicClient(process.env.ANTHROPIC_API_KEY),
  backup: new OpenAIClient(process.env.OPENAI_API_KEY),
};

export async function generateContentWithFallback(prompt: string) {
  try {
    return await apiClients.primary.generate(prompt);
  } catch (error) {
    console.warn('Primary API 실패, 백업 API 사용');
    return await apiClients.backup.generate(prompt);
  }
}
```

**서비스 다운 대응**
```typescript
// 캐시된 응답 제공
export async function getCachedResponse(prompt: string) {
  const cached = await getFromCache(prompt);
  if (cached) {
    return { content: cached, source: 'cache' };
  }
  
  try {
    const response = await generateContent(prompt);
    await saveToCache(prompt, response);
    return { content: response, source: 'api' };
  } catch (error) {
    return { 
      content: '죄송합니다. 현재 서비스에 일시적인 문제가 있습니다.', 
      source: 'fallback' 
    };
  }
}
```

## B.7 비용 관리

### 1. 사용량 모니터링

**일일 사용량 체크**
```typescript
export async function dailyUsageReport() {
  const usage = await getApiUsage();
  const costs = {
    claude: usage.claude * 0.01,
    openai: usage.openai * 0.002,
    github: 0, // 무료
  };
  
  const total = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
  
  if (total > process.env.DAILY_BUDGET) {
    await sendBudgetAlert(`일일 예산 초과: ${total}`);
  }
}
```

### 2. 요청 최적화

**캐싱 전략**
```typescript
const cache = new Map();

export async function optimizedGenerate(prompt: string) {
  const cacheKey = hashPrompt(prompt);
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const result = await generateContent(prompt);
  cache.set(cacheKey, result);
  
  // 캐시 크기 제한
  if (cache.size > 1000) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  
  return result;
}
```

**요청 제한**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100회 요청
  message: '너무 많은 요청이 발생했습니다.',
});

export { limiter };
```

---

## 🎯 마무리

이 가이드를 통해 **Claude AI 웹 애플리케이션 구축의 전체 과정**을 완료했습니다.

**핵심 학습 내용**:
- ✅ **프로젝트 설계**: 요구사항 분석부터 아키텍처 설계
- ✅ **AI 통합**: Claude API를 활용한 콘텐츠 생성
- ✅ **풀스택 개발**: Frontend, Backend, Database 구현
- ✅ **배포 자동화**: GitHub + Vercel을 통한 CI/CD
- ✅ **보안 관리**: API 키와 환경변수 안전한 관리

**개발자로서 성장한 부분**:
- 🚀 **문제해결 능력**: 오류 발생 시 체계적 디버깅
- 🔧 **도구 활용**: Git, GitHub, Vercel 등 개발 도구 숙련
- 🛡️ **보안 의식**: API 키 관리와 보안 모범 사례 적용
- 📚 **문서화**: 프로젝트 과정 체계적 정리

**다음 도전 과제**:
- 🎨 고급 UI/UX 구현
- 🔐 사용자 인증 시스템
- 📊 데이터 분석 기능
- 🌐 다국어 지원
- 📱 모바일 앱 개발

**지속적 학습을 위한 리소스**:
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Anthropic API 문서](https://docs.anthropic.com)
- [Git 공식 가이드](https://git-scm.com/docs)
- [Vercel 배포 가이드](https://vercel.com/docs)

계속해서 새로운 기술을 학습하고 실제 프로젝트에 적용해보세요! 🚀