'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AcademicResearchPage() {
  const [fadeIn, setFadeIn] = useState({
    hero: false,
    content: false,
  });

  const [activeTab, setActiveTab] = useState('thesis');

  useEffect(() => {
    const timers = [
      setTimeout(() => setFadeIn(prev => ({ ...prev, hero: true })), 100),
      setTimeout(() => setFadeIn(prev => ({ ...prev, content: true })), 300),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const researchData = {
    thesis: {
      title: "학위논문",
      items: [
        { year: "2008", title: "[박사학위논문] 사회과 학업성취도 평가의 인지적 특성 분석", desc: "한국교원대학교 대학원" },
        { year: "1998", title: "[석사학위논문] 초등학교 사회과 敎科書 評價要素 개발에 관한 연구", desc: "서울교육대학교 교육대학원" }
      ]
    },
    textbook: {
      title: "교과서 집필",
      items: [
        { year: "2009-2011", title: "2007 교육과정 초등학교 사회교과서, 지도서 집필", desc: "" },
        { year: "2001-2002", title: "7차 교육과정 초등학교 사회교과서, 지도서 집필", desc: "" }
      ]
    },
    papers: {
      title: "연구논문 (학술지)",
      items: [
        { year: "2013", title: "[공동] 교육연구에 있어서 분산분석의 일반적 적용에 관한 연구", desc: "한국초등교육, 24(2), 1-18" },
        { year: "2013", title: "[공동] 국가수준 학업성취도 평가에 나타난 고등학교 학업성취 격차", desc: "교육평가연구, 26(2), 297-317" },
        { year: "2012", title: "[공동] 공공쟁점 수업 참여 학습자의 토론에 대한 인식 변화", desc: "시민교육연구, 44(2), 101-127" },
        { year: "2011", title: "[공동] 우리나라 초, 중학생의 ICT 리터러시 수준 평가", desc: "한국초등교육, 22(3), 195-211" },
        { year: "2009", title: "[공동] 초등 역사학습 평가의 실태와 새로운 방향 모색 -학교 수준의 성취도 평가를 중심으로-", desc: "역사교육연구, -(9), 7-39" },
        { year: "2005", title: "사회과 선호 척도의 구인 타당도 분석", desc: "사회과교육, 44(4), 93-110" },
        { year: "2005", title: "[공동] 초등학교 사회과 수업 풍토에 대한 연구- Newmann의 교실사려도(Classroom thoughtfulness)를 중심으로 -", desc: "사회과교육연구, 12(2), 355-371" },
        { year: "2004", title: "사회과 학업성취도 평가문항의 타당성 검토", desc: "사회과교육, 43(2), 85-108" },
        { year: "1998", title: "사회과교육에서 웹기반 교수", desc: "사회과교육, -(31), 289-307" },
        { year: "1997", title: "사회과 교수.학습 활동에서의 인터넷 활용 방안", desc: "사회과교육, -(30), 179-200" }
      ]
    },
    reports: {
      title: "연구보고서 및 공동연구과제",
      items: [
        { year: "2019", title: "[공동] 국가단위 평가의 수요자 중심 정보 활용 서비스 시스템 구축 및 운영(Ⅶ)", desc: "한국교육과정평가원, RRE 2019-1" },
        { year: "2019", title: "[공동] 제4차년도(2019) 부산교육종단연구(BELS) 기초 분석 보고서", desc: "부산광역시교육청 교육정책연구소" },
        { year: "2017", title: "[공동] 제2차년도(2017) 부산교육종단연구(BELS) 기초 분석 보고서", desc: "부산광역시교육청 교육정책연구소" },
        { year: "2016", title: "[공동] 서울교육종단연구 7차년도기초분석 보고서", desc: "서울특별시교육청교육연구정보원 교육정책연구소, 서교연 2016-50" },
        { year: "2016", title: "[공동] 제1차년도(2016) 부산교육종단연구(BELS) 기초 분석 보고서", desc: "부산광역시교육청 교육정책연구소" },
        { year: "2013", title: "[공동] 컴퓨터 기반 국가수준 학업성취도 평가 도입 방안", desc: "한국교육과정평가원, CRE 2013-5" },
        { year: "2013", title: "[공동] 제4차년도 국가영어능력평가시험(1급) 동등화 연구", desc: "국립국제교육원" },
        { year: "2012", title: "[공동] 2012 KICE 정책 제안서II : 교육평가, 대학수학능력시험, 교과서검정, 국가영어능력평가시험 분야", desc: "한국교육과정평가원, ORM 2012-123-2" },
        { year: "2012", title: "[공동] 국가수준 학업성취도 평가 개선 연구", desc: "한국교육과정평가원, 교육과학기술부 수탁과제 2012-1" },
        { year: "2012", title: "[공동] 2011년 국가수준 학업성취도 평가 결과: 학업성취 및 향상 특성 분석", desc: "한국교육과정평가원, RRE 2012-1-5" },
        { year: "2012", title: "[공동] 2011년 국가수준 학업성취도 평가 결과: 학력의 상향평준화 현상과 교육정책 효과 분석", desc: "한국교육과정평가원, RRE 2012-1-4" },
        { year: "2012", title: "[공동] 2011년 국가수준 학업성취도 평가 결과: 초등학교 학업성취도 변화 추이 분석", desc: "한국교육과정평가원, RRE 2012-1-1/2/3" },
        { year: "2012", title: "[공동] 학업성취도에 대한 방과후학교 프로그램 효과 분석", desc: "한국교육개발원, CR2012-26" },
        { year: "2011", title: "[공동] 종합적 사고력 진단도구 동형검사 개발", desc: "한국직업능력연구원" },
        { year: "2011", title: "[공동] 사회통합 관련 내용 반영을 위한 교과서 분석 연구", desc: "한국교과서연구재단, 연구보고서 2011-03" },
        { year: "2011", title: "[공동] 2012년 국가수준 학업성취도 평가 채점 표준화 방안 연구", desc: "교육과학기술부, 수탁과제 2011-1" },
        { year: "2010", title: "[공동] 국가수준 초·중등학생 ICT리터러시 수준 평가 연구", desc: "한국교육학술정보원" },
        { year: "2009", title: "[공동] 종합적 사고력 주관식 진단도구 채점기준 및 매뉴얼 개발", desc: "한국직업능력연구원" },
        { year: "2009", title: "[공동] 국가수준 초·중등학생 ICT 리터러시 수준 평가 연구", desc: "한국교육학술정보원" },
        { year: "2009", title: "[공동] 학교교육 내실화를 위한 초 중학교 수행평가 적용 프로그램 개발", desc: "한국교육과정평가원, RRE 2009-4" },
        { year: "2008", title: "[공동] 한국형 초등 적성검사", desc: "서울교대 교육심리측정연구소, 교학사" },
        { year: "2007", title: "[공동] 초4-초6 교과학습 부진학생 진단도구 개발", desc: "서울특별시교육청" },
        { year: "2006", title: "[공동] 사이버가정학습 학습주제별 콘텐츠 유형 적용 방안 연구 – 사회과", desc: "한국교육학술정보원" }
      ]
    }
  };

  const tabs = [
    { id: 'thesis', label: '학위논문', count: 2 },
    { id: 'textbook', label: '교과서 집필', count: 2 },
    { id: 'papers', label: '연구논문', count: 10 },
    { id: 'reports', label: '연구보고서', count: 23 }
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
            <Link href="/activities/academic-research" className="text-blue-700 font-bold hover:text-blue-800 transition-colors">
              연구 활동
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/activities/lectures-advisory" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
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
            연구 활동
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-4 font-medium">
            Research Activities
          </p>
          
          <div className="flex items-center justify-center gap-4 text-slate-500">
            <span>1997-2019</span>
            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
            <span>총 37개 연구</span>
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
                  학위논문, 교과서 집필, 학술논문 발표 및 국가기관 연구과제를 수행했습니다. 
                  사회과 교육, 교육평가, ICT 활용 교육 등 다양한 영역에서 이론과 실천을 연결하는 
                  연구 활동을 통해 한국 교육 발전에 기여하고 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {tab.label}
                <span className="ml-2 text-sm">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            <h2 className="text-2xl font-space-grotesk font-semibold text-slate-800 mb-6">
              {researchData[activeTab].title}
            </h2>
            
            <div className="space-y-4">
              {researchData[activeTab].items.map((item, index) => (
                <div key={index} className="quote-sheet">
                  <div className="relative">
                    <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="text-lg font-medium text-blue-600 whitespace-nowrap">
                          {item.year}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-slate-800 mb-1">
                            {item.title}
                          </h3>
                          {item.desc && (
                            <p className="text-base text-slate-600">
                              {item.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Interests */}
          <div className="quote-sheet mt-12">
            <div className="relative">
              <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
              
              <div className="relative z-10">
                <h2 className="text-2xl font-space-grotesk font-semibold text-slate-800 mb-6">
                  주요 관심 분야
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">연구 주제</h3>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>교육평가 방법론과 평가 도구 개발</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>사회과 교육과정 및 교재 개발</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">미래 교육</h3>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>디지털 리터러시와 ICT 활용 교육</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>블렌디드 러닝과 미래 교육 환경</span>
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