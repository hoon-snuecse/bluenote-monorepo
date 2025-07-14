'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@bluenote/ui';
import { Sparkles, Check, X, AlertCircle } from 'lucide-react';

export default function UITestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-12">
      <div className="container-custom">
        <h1 className="text-4xl font-bold gradient-text mb-8 text-center">
          UI 컴포넌트 테스트
        </h1>

        {/* 색상 팔레트 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">색상 팔레트</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-slate-700">Primary (Blue)</h3>
              <div className="space-y-1">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                  <div key={shade} className={`h-10 bg-blue-${shade} rounded flex items-center px-3`}>
                    <span className={`text-xs ${shade >= 500 ? 'text-white' : 'text-slate-700'}`}>
                      blue-{shade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-slate-700">Neutral (Slate)</h3>
              <div className="space-y-1">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                  <div key={shade} className={`h-10 bg-slate-${shade} rounded flex items-center px-3`}>
                    <span className={`text-xs ${shade >= 500 ? 'text-white' : 'text-slate-700'}`}>
                      slate-{shade}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-slate-700">평가 등급</h3>
              <div className="space-y-2">
                <div className="h-12 grade-excellent rounded-lg flex items-center px-3 border">
                  <Check className="w-4 h-4 mr-2" />
                  매우 우수
                </div>
                <div className="h-12 grade-good rounded-lg flex items-center px-3 border">
                  <Check className="w-4 h-4 mr-2" />
                  우수
                </div>
                <div className="h-12 grade-fair rounded-lg flex items-center px-3 border">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  보통
                </div>
                <div className="h-12 grade-poor rounded-lg flex items-center px-3 border">
                  <X className="w-4 h-4 mr-2" />
                  미흡
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 카드 컴포넌트 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">카드 컴포넌트</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>기본 카드</CardTitle>
                <CardDescription>Glass 효과가 적용된 카드입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  호버 시 그림자가 진해지는 효과가 있습니다.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-blue-900">커스텀 카드</CardTitle>
                <CardDescription className="text-blue-700">
                  색상이 변경된 카드
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-blue-600">
                  클래스를 추가하여 스타일 변경 가능
                </p>
              </CardContent>
            </Card>

            <div className="quote-sheet">
              <h3 className="text-lg font-semibold mb-2">Quote Sheet 스타일</h3>
              <p className="text-slate-600">
                bluenote.site에서 사용하는 특별한 카드 스타일
              </p>
            </div>
          </div>
        </section>

        {/* 버튼 컴포넌트 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">버튼 컴포넌트</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary 버튼</Button>
              <Button variant="secondary">Secondary 버튼</Button>
              <Button variant="outline">Outline 버튼</Button>
              <Button variant="ghost">Ghost 버튼</Button>
              <Button variant="danger">Danger 버튼</Button>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="sm">작은 버튼</Button>
              <Button size="md">중간 버튼</Button>
              <Button size="lg">큰 버튼</Button>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button disabled>비활성화</Button>
              <Button variant="primary" className="gap-2">
                <Sparkles className="w-4 h-4" />
                아이콘 버튼
              </Button>
            </div>
          </div>
        </section>

        {/* 애니메이션 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">애니메이션</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="animate-fade-in">
              <CardContent className="py-8 text-center">
                <div className="text-4xl mb-2">✨</div>
                <p className="font-medium">Fade In</p>
                <p className="text-sm text-slate-500">페이드 인 효과</p>
              </CardContent>
            </Card>

            <Card className="animate-fade-up">
              <CardContent className="py-8 text-center">
                <div className="text-4xl mb-2">⬆️</div>
                <p className="font-medium">Fade Up</p>
                <p className="text-sm text-slate-500">아래에서 위로</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-8 text-center">
                <div className="text-4xl mb-2 animate-spin-slow">⚙️</div>
                <p className="font-medium">Spin Slow</p>
                <p className="text-sm text-slate-500">천천히 회전</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Glass 효과 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Glass 효과</h2>
          <div className="relative h-64 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl overflow-hidden">
            <div className="absolute inset-4 glass rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Glass 컨테이너</h3>
              <p className="text-slate-700">
                배경이 흐릿하게 보이는 glass 효과입니다.
                <br />
                backdrop-blur와 투명도를 조합하여 구현됩니다.
              </p>
            </div>
          </div>
        </section>

        {/* 폰트 시스템 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">폰트 시스템</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-space-grotesk text-2xl mb-2">Space Grotesk Font</h3>
              <p className="text-slate-600">영문 제목에 사용되는 폰트입니다.</p>
            </div>
            <div>
              <h3 className="font-inter text-2xl mb-2">Inter Font</h3>
              <p className="text-slate-600">기본 영문 본문 폰트입니다.</p>
            </div>
            <div>
              <h3 className="font-gowun-dodum text-2xl mb-2">고운돋움 폰트</h3>
              <p className="text-slate-600">한글 제목이나 강조에 사용됩니다.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}