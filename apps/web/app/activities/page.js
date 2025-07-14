'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, GraduationCap, BookOpen, Users } from 'lucide-react';

export default function ActivitiesPage() {
  const [fadeIn, setFadeIn] = useState({
    hero: false,
    card1: false,
    card2: false,
    card3: false,
  });

  useEffect(() => {
    const timers = [
      setTimeout(() => setFadeIn(prev => ({ ...prev, hero: true })), 100),
      setTimeout(() => setFadeIn(prev => ({ ...prev, card1: true })), 500),
      setTimeout(() => setFadeIn(prev => ({ ...prev, card2: true })), 700),
      setTimeout(() => setFadeIn(prev => ({ ...prev, card3: true })), 900),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const researchAreas = [
    {
      icon: Users,
      title: "학교 혁신",
      subtitle: "School Innovation",
      description: "혁신학교 운영 지원, 교원학습공동체 활성화, 교육 현장 평가 방법 개선을 위한 활동",
      href: "/activities/school-innovation",
      period: "2016-2023",
      count: "15개 활동"
    },
    {
      icon: FileText,
      title: "연구 활동",
      subtitle: "Research Activities",
      description: "학위논문, 교과서 집필, 학술논문 발표 및 국가기관 연구과제 수행",
      href: "/activities/academic-research",
      period: "1997-2019",
      count: "37개 연구"
    },
    {
      icon: BookOpen,
      title: "강의 및 자문",
      subtitle: "Lectures & Advisory",
      description: "대학에서의 강의 활동과 한국교육과정평가원 등 전문기관 자문",
      href: "/activities/lectures-advisory",
      period: "2004-2022",
      count: "15개 활동"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`py-24 px-4 text-center transition-all duration-1000 ${
        fadeIn.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="container-custom">
          <h1 className="text-5xl md:text-6xl font-space-grotesk font-bold mb-6 bg-gradient-to-br from-slate-900 to-blue-600 bg-clip-text text-transparent">
            활동 및 협력
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-8 font-medium">
            교육 현장과 함께하는 연구자의 기록
          </p>
        </div>
      </section>

      {/* Main Interests Section */}
      <section className="py-8 px-4">
        <div className="container-custom">
          <div className="quote-sheet max-w-4xl mx-auto mb-16">
            <div className="relative">
              <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
              
              <div className="relative z-10">
                <h2 className="text-2xl font-space-grotesk font-semibold text-slate-800 mb-6 text-center">
                  주요 관심 영역
                </h2>
                
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-700 mb-3">학교 혁신 및 교원 전문성</h3>
                    <ul className="space-y-2 text-slate-600">
                      <li>• 교원학습공동체 운영</li>
                      <li>• 학생 주도성과 자치 활동</li>
                      <li>• 예비교사 및 현직교사 연수</li>
                      <li>• 교육정책 자문 및 컨설팅</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-blue-700 mb-3">교육평가 및 연구 방법</h3>
                    <ul className="space-y-2 text-slate-600">
                      <li>• 과정중심평가와 성장중심평가</li>
                      <li>• 교육평가 도구 개발</li>
                      <li>• 교육과정-수업-평가-기록 일체화</li>
                      <li>• 교육 빅데이터 분석과 활용</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-blue-700 mb-3">미래 교육</h3>
                    <ul className="space-y-2 text-slate-600">
                      <li>• 디지털 리터러시와 ICT 활용</li>
                      <li>• 블렌디드 러닝 환경 구축</li>
                      <li>• 스마트 교육 시스템</li>
                      <li>• AI 시대의 교육 혁신</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Areas Cards */}
      <section className="py-8 px-4">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {researchAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <Link
                  key={index}
                  href={area.href}
                  className={`quote-sheet hover:shadow-xl transition-all duration-1000 ${
                    fadeIn[`card${index + 1}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  <div className="relative">
                    <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-space-grotesk font-bold text-slate-800 mb-1">
                            {area.title}
                          </h3>
                          <p className="text-base text-blue-600 italic">
                            {area.subtitle}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-base text-slate-600 mb-4 leading-relaxed">
                        {area.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-slate-500">
                          <span>{area.period}</span>
                          <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                          <span>{area.count}</span>
                        </div>
                        <span className="text-blue-600 font-semibold">
                          자세히 보기 →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}