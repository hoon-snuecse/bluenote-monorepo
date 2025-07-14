'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function LecturesAdvisoryPage() {
  const [fadeIn, setFadeIn] = useState({
    hero: false,
    content: false,
  });

  const [activeTab, setActiveTab] = useState('lectures');

  useEffect(() => {
    const timers = [
      setTimeout(() => setFadeIn(prev => ({ ...prev, hero: true })), 100),
      setTimeout(() => setFadeIn(prev => ({ ...prev, content: true })), 300),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const lectures = [
    { year: "2021", univ: "건국대", level: "(대학원)", course: "진로진학상담교과 평가 방법 개발 및 활용" },
    { year: "2020", univ: "건국대", level: "(대학원)", course: "교육자료의 통계적 분석, 진로진학상담교과 평가 방법 개발 및 활용" },
    { year: "2019", univ: "충북대", level: "(학부)", course: "통합사회과교육론" },
    { year: "2019", univ: "건국대", level: "(대학원)", course: "배움중심평가, 진로진학상담교과 평가 방법 개발 및 활용" },
    { year: "2016, 2018", univ: "서울교대", level: "(대학원)", course: "교육연구법" },
    { year: "2015", univ: "서울교대", level: "(대학원)", course: "교육연구방법론" },
    { year: "2013-2015", univ: "서울교대", level: "(대학원)", course: "초등영재교육 연구방법론" },
    { year: "2011, 2012", univ: "서울교대", level: "(대학원)", course: "초등사회과 연구방법론" },
    { year: "2004, 2005", univ: "서울교대", level: "(대학원)", course: "초등사회과 교육평가론" },
    { year: "2004-2013", univ: "서울교대", level: "(학부)", course: "사회과교육방법, 사회과교재연구, 사회과자료제작, 사회과교육특강, 사회과학방법론, 교육통계" }
  ];

  const advisory = [
    { 
      date: "2022", 
      org: "한국교육과정평가원", 
      desc: "'2022 개정 교육과정 적용을 대비한 학교생활기록부 체제 개선 방향 탐색' 성적표 개선(안) 전문가 협의회" 
    },
    { 
      date: "2022", 
      org: "한국교육과정평가원", 
      desc: "디지털 교육환경 및 교사의 학생평가 역량 관련 논의를 위한 워킹그룹 협의회" 
    },
    { 
      date: "2022.2.11.", 
      org: "한국교육과정평가원", 
      desc: "'2022년 컴퓨터 기반 학업성취도 평가 도구 개발을 위한 수업연구회 운영' 전문가 협의회" 
    },
    { 
      date: "2021.3.20.", 
      org: "부산대학교", 
      desc: "제5차년도(2020) 부산교육종단연구(BELS) 데이터클리닝" 
    },
    { 
      date: "2020.10.16./10.29.", 
      org: "한국교육과정평가원", 
      desc: "'원격수업에 따른 학생평가 제도의 현장 적합성 검토' 전문가 협의회" 
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <div className="pt-8 px-4">
        <div className="container-custom">
          <Link href="/activities" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-6">
            <ChevronLeft className="w-4 h-4" />
            <span>활동 및 협력으로 돌아가기</span>
          </Link>

          {/* Sub-navigation */}
          <div className="flex flex-wrap items-center gap-6 text-lg bg-white/90 backdrop-blur-lg border border-slate-200 rounded-lg p-4 shadow-sm">
            <Link href="/activities/school-innovation" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
              학교 혁신
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/activities/academic-research" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
              연구 활동
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/activities/lectures-advisory" className="text-blue-700 font-bold hover:text-blue-800 transition-colors">
              강의 및 자문
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className={`py-16 px-4 text-center transition-all duration-1000 ${
        fadeIn.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-space-grotesk font-bold mb-4 bg-gradient-to-br from-slate-900 to-blue-600 bg-clip-text text-transparent">
            강의 및 자문
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-4 font-medium">
            University Lectures & Advisory
          </p>
          
          <div className="flex items-center justify-center gap-4 text-slate-500">
            <span>2004-2022</span>
            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
            <span>15개 활동</span>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className={`py-16 px-4 transition-all duration-1000 ${
        fadeIn.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="container-custom max-w-5xl">
          <div className="quote-sheet mb-12">
            <div className="relative">
              <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
              <div className="relative z-10">
                <p className="text-lg text-slate-600 leading-relaxed">
                  대학에서의 강의 활동과 한국교육과정평가원 등 전문기관 자문을 통해 
                  예비교사와 현직교사의 전문성 신장을 지원하고, 국가 교육정책 개선에 기여하고 있습니다. 
                  교육평가, 연구방법론, 사회과교육 분야의 전문 지식을 공유하며 미래 교육을 준비합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <button
              onClick={() => setActiveTab('lectures')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'lectures'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              대학 강의
              <span className="ml-2 text-sm">(10)</span>
            </button>
            <button
              onClick={() => setActiveTab('advisory')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'advisory'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              전문가 자문
              <span className="ml-2 text-sm">(5)</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            <h2 className="text-2xl font-space-grotesk font-semibold text-slate-800 mb-6">
              {activeTab === 'lectures' ? '대학 및 대학원 강의' : '전문가 자문'}
            </h2>
            
            <div className="space-y-4">
              {activeTab === 'lectures' ? (
                lectures.map((lecture, index) => (
                  <div key={index} className="quote-sheet">
                    <div className="relative">
                      <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start gap-4">
                          <div className="text-lg font-medium text-blue-600 whitespace-nowrap">
                            {lecture.year}
                          </div>
                          <div className="flex-1">
                            <div className="mb-1">
                              <span className="font-semibold text-slate-800">{lecture.univ}</span>
                              <span className="text-slate-600 ml-2">{lecture.level}</span>
                            </div>
                            <p className="text-base text-slate-700">
                              {lecture.course}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                advisory.map((item, index) => (
                  <div key={index} className="quote-sheet">
                    <div className="relative">
                      <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start gap-4">
                          <div className="text-lg font-medium text-blue-600 whitespace-nowrap">
                            {item.date}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-slate-800 mb-2">
                              {item.org}
                            </h3>
                            <p className="text-base text-slate-600">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Key Interests */}
          <div className="quote-sheet">
            <div className="relative">
              <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
              
              <div className="relative z-10">
                <h2 className="text-2xl font-space-grotesk font-semibold text-slate-800 mb-6">
                  주요 관심 분야
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">교육 전문성</h3>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>예비교사 및 현직교사의 전문성 신장</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>교육평가와 연구방법론의 이론과 실제</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">정책 기여</h3>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>국가 교육정책 및 평가 체계 개선</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>교육 빅데이터 분석과 활용</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}