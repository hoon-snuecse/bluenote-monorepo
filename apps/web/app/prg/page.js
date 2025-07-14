'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PenTool, Calculator, BarChart2, Brain, Lock, Sparkles } from 'lucide-react';
import { useSession } from '@bluenote/auth';

export default function ProgramsPage() {
  const [fadeIn, setFadeIn] = useState({
    hero: false,
    card1: false,
    card2: false,
    card3: false,
    card4: false,
  });
  const { data: session } = useSession();

  useEffect(() => {
    const timers = [
      setTimeout(() => setFadeIn(prev => ({ ...prev, hero: true })), 100),
      setTimeout(() => setFadeIn(prev => ({ ...prev, card1: true })), 500),
      setTimeout(() => setFadeIn(prev => ({ ...prev, card2: true })), 700),
      setTimeout(() => setFadeIn(prev => ({ ...prev, card3: true })), 900),
      setTimeout(() => setFadeIn(prev => ({ ...prev, card4: true })), 1100),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const programs = [
    {
      icon: PenTool,
      title: "글쓰기 평가 채점 시스템",
      subtitle: "AI Writing Assessment",
      description: "학생들의 글쓰기를 AI가 분석하고 개별 맞춤형 피드백을 제공하는 평가 도구",
      href: "/prg/grading",
      status: "active",
      requireAuth: true,
      hasAI: true,
      features: [
        "4가지 평가 영역 분석",
        "개별 학생 보고서 생성",
        "교사 대시보드 제공",
        "PDF/Excel 내보내기"
      ]
    },
    {
      icon: Calculator,
      title: "수학 문제 생성기",
      subtitle: "Math Problem Generator",
      description: "학년별, 단원별 맞춤형 수학 문제를 자동으로 생성하는 도구",
      href: "/prg/math-generator",
      status: "coming-soon",
      requireAuth: true,
      features: [
        "학년별 난이도 조절",
        "문제 유형 선택",
        "정답 및 풀이 제공",
        "워크시트 생성"
      ]
    },
    {
      icon: BarChart2,
      title: "학습 분석 대시보드",
      subtitle: "Learning Analytics",
      description: "학생들의 학습 데이터를 시각화하고 인사이트를 제공하는 분석 도구",
      href: "/prg/analytics",
      status: "coming-soon",
      requireAuth: true,
      features: [
        "실시간 데이터 시각화",
        "학습 패턴 분석",
        "성취도 예측",
        "맞춤형 추천"
      ]
    },
    {
      icon: Brain,
      title: "AI 튜터 봇",
      subtitle: "AI Tutor Bot",
      description: "학생 개인의 학습 수준에 맞춰 1:1 교육을 제공하는 AI 튜터",
      href: "/prg/ai-tutor",
      status: "development",
      requireAuth: true,
      features: [
        "개인 맞춤형 학습",
        "실시간 질의응답",
        "학습 진도 관리",
        "오답 분석"
      ]
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">사용 가능</span>;
      case 'coming-soon':
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">준비 중</span>;
      case 'development':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">개발 중</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`py-24 px-4 text-center transition-all duration-1000 ${
        fadeIn.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="container-custom">
          <h1 className="text-5xl md:text-6xl font-space-grotesk font-bold mb-6 bg-gradient-to-br from-slate-900 to-blue-600 bg-clip-text text-transparent">
            교육 프로그램
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-8 font-medium">
            AI와 데이터로 교육의 미래를 만들어가는 도구들
          </p>
          
          <p className="text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed">
            교사와 학생을 위한 혁신적인 교육 도구들을 제공합니다. 
            AI 기술을 활용하여 개인 맞춤형 학습 경험을 만들어갑니다.
          </p>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-8 px-4">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {programs.map((program, index) => {
              const Icon = program.icon;
              const isDisabled = program.status !== 'active' || (program.requireAuth && !session);
              
              const CardContent = (
                <div className={`quote-sheet hover:shadow-xl transition-all duration-1000 ${
                  fadeIn[`card${index + 1}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } ${isDisabled ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <div className="relative">
                    <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-space-grotesk font-bold text-slate-800 mb-1 flex items-center gap-2">
                              {program.hasAI && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded text-xs font-medium">
                                  <Sparkles className="w-3 h-3" />
                                  AI
                                </span>
                              )}
                              {program.title}
                            </h3>
                            <p className="text-base text-blue-600 italic">
                              {program.subtitle}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(program.status)}
                      </div>
                      
                      <p className="text-base text-slate-600 mb-4 leading-relaxed">
                        {program.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <h4 className="text-sm font-semibold text-slate-700">주요 기능:</h4>
                        <ul className="text-sm text-slate-600 space-y-1">
                          {program.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {program.requireAuth && !session && (
                          <div className="flex items-center gap-2 text-sm text-amber-600">
                            <Lock className="w-4 h-4" />
                            <span>로그인 필요</span>
                          </div>
                        )}
                        {program.status === 'active' && (!program.requireAuth || session) && (
                          <span className="text-blue-600 font-semibold ml-auto">
                            시작하기 →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );

              if (program.status === 'active' && (!program.requireAuth || session)) {
                return (
                  <Link key={index} href={program.href}>
                    {CardContent}
                  </Link>
                );
              }

              return <div key={index}>{CardContent}</div>;
            })}
          </div>

          {/* Login Notice */}
          {!session && (
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                <Lock className="w-5 h-5 text-amber-600" />
                <p className="text-amber-800">
                  모든 프로그램을 사용하려면 <Link href="/auth/signin" className="font-semibold underline">로그인</Link>이 필요합니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}