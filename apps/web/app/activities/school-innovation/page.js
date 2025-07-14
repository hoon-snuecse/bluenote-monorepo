'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function SchoolInnovationPage() {
  const [fadeIn, setFadeIn] = useState({
    hero: false,
    content: false,
  });

  const [activeTab, setActiveTab] = useState('innovation');

  useEffect(() => {
    const timers = [
      setTimeout(() => setFadeIn(prev => ({ ...prev, hero: true })), 100),
      setTimeout(() => setFadeIn(prev => ({ ...prev, content: true })), 300),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const innovationActivities = [
    { 
      date: "2023.5.24.", 
      org: "서울특별시 서부교육지원청", 
      title: "(강의) 학생자치, 수업에서 참여까지", 
      desc: "'누구나 할 수 있는 학생자치 활동' 교사연수" 
    },
    { 
      date: "2023.4.17.", 
      org: "서울특별시교육청 교육혁신과", 
      title: "서울형혁신학교 예산 성과분석 자료개발 자문회의", 
      desc: "" 
    },
    { 
      date: "2022.11.23.", 
      org: "2022 서부 초등 학교혁신 한마당", 
      title: "(강의) 학생자치, 회의부터 활동까지 - 학생들이 만들어가는 이야기", 
      desc: "" 
    },
    { 
      date: "2022.6.29.", 
      org: "서울특별시 서부교육지원청", 
      title: "(강의) 학부모회 공감 소통", 
      desc: "공감하고 소통하는 2022 서부학부모회 네트워크 연수" 
    },
    { 
      date: "2021.10.20.", 
      org: "서울특별시교육청 교육혁신과 학교혁신기획운영팀 학교혁신지원센터", 
      title: "(활동) 2022 학교 안 교원학습공동체 리더십 지원단", 
      desc: "" 
    },
    { 
      date: "2021.3.4.", 
      org: "서울특별시교육청 교육혁신과 학교혁신지원센터", 
      title: "(강의) 교원학습공동체 연수 관리 시스템 개발- 기획 및 전망", 
      desc: "2021 학교안교원학습공동체 업무담당자 워크숍" 
    },
    { 
      date: "2020.12.23.", 
      org: "서울특별시교육청 교육혁신과 학교혁신지원센터", 
      title: "(활동) 2021 학교 안 교원학습공동체 지원단", 
      desc: "" 
    },
    { 
      date: "2019.2.19.", 
      org: "서울특별시교육청 교육연수원", 
      title: "(강의) 사례로 만나는 교원학습공동체1: 교실평가", 
      desc: "2019 초등 손에 잡히는 교원학습공동체 직무연수" 
    }
  ];

  const trainingActivities = [
    { 
      date: "2022.7.27.-9.6.", 
      org: "서울특별시교육청 초등교육과", 
      title: "2022 학생평가 장학자료 개발 협의회", 
      desc: "" 
    },
    { 
      date: "2022.7.21.", 
      org: "한국교육과정평가원", 
      title: "(강의) 과정중심평가 결과의 누가 기록", 
      desc: "2022년 교실수업‧평가 현장지원단(중앙지원단) 3차 워크숍" 
    },
    { 
      date: "2022.4.25.-29.", 
      org: "서울수색초등학교", 
      title: "(컨설팅 장학) 스마트 하지 구축을 통한 맞춤형 수업방법 개선", 
      desc: "" 
    },
    { 
      date: "2021.4.19.-12.31.", 
      org: "서울교육대학교부속초등학교", 
      title: "교육과정 연구학교 자문위원", 
      desc: "연구학교 연구 결과의 효과성 및 만족도 검증 및 분석 자문" 
    },
    { 
      date: "2020.12.14.-18.", 
      org: "서울교육대학교부속초등학교", 
      title: "교육과정 연구학교 자문위원", 
      desc: "배움선택활동 편성을 교육과정 탄력적 운영 모델 개발 연구과제 검증 및 분석 자문" 
    },
    { 
      date: "2020.7.24.", 
      org: "서울성원초등학교", 
      title: "학교 방송시설 개선 사업 전문가 협의회", 
      desc: "" 
    },
    { 
      date: "2016.11.18.", 
      org: "서울특별시 서부교육지원청", 
      title: "(강의) 수행평가 어떻게 할까? - 수행평가의 사례를 통해 의미 찾기", 
      desc: "" 
    }
  ];

  const tabs = [
    { id: 'innovation', label: '혁신학교 활동', count: 8 },
    { id: 'training', label: '연수 및 컨설팅', count: 7 }
  ];

  const currentData = activeTab === 'innovation' ? innovationActivities : trainingActivities;

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
            <Link href="/activities/school-innovation" className="text-blue-700 font-bold hover:text-blue-800 transition-colors">
              학교 혁신
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/activities/academic-research" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
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
            학교 혁신
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-4 font-medium">
            School Innovation
          </p>
          
          <div className="flex items-center justify-center gap-4 text-slate-500">
            <span>2016-2023</span>
            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
            <span>총 15개 활동</span>
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
                  서울특별시교육청 혁신학교 운영 지원 및 교원학습공동체 활성화를 위한 다양한 활동을 수행하고 있습니다. 
                  학생 자치 강화, 교원 전문성 신장, 과정중심평가 확산, 미래형 교육 환경 구축 등 
                  학교 현장의 실질적인 변화를 이끌어내기 위한 강의, 컨설팅, 자문 활동을 진행합니다.
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
              {activeTab === 'innovation' ? '혁신학교 관련 활동' : '연수 및 컨설팅'}
            </h2>
            
            <div className="space-y-4">
              {currentData.map((item, index) => (
                <div key={index} className="quote-sheet">
                  <div className="relative">
                    <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="text-lg font-medium text-blue-600 whitespace-nowrap">
                          {item.date}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-base text-slate-600 mb-1">
                            {item.org}
                          </p>
                          {item.desc && (
                            <p className="text-base text-slate-500 italic">
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
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">학교 혁신</h3>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>교원학습공동체 운영과 교사 협력 문화</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>학생 주도성 강화와 민주적 학교 문화</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>혁신학교 모델 개발과 성과 분석</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">교육 전문성</h3>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>과정중심평가와 학생평가 혁신</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>교육과정-수업-평가-기록의 일체화</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>미래형 교육 환경과 스마트 교육</span>
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