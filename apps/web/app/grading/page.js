'use client';

import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Upload, 
  Brain, 
  BarChart3, 
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function GradingPage() {
  const router = useRouter();

  const workflowSteps = [
    {
      step: 1,
      title: '과제 생성',
      description: '평가할 글쓰기 과제를 만들고 평가 기준을 설정합니다',
      icon: FileText,
      action: '과제 만들기',
      href: '/grading/assignments/new',
      color: 'blue'
    },
    {
      step: 2,
      title: '학생 제출',
      description: '학생들이 과제 링크를 통해 글을 제출합니다',
      icon: Upload,
      action: '제출 링크 복사',
      href: '/grading/assignments',
      color: 'green'
    },
    {
      step: 3,
      title: 'AI 평가',
      description: 'AI가 제출된 글을 자동으로 분석하고 평가합니다',
      icon: Brain,
      action: '평가 실행',
      href: '/grading/assignments',
      color: 'purple'
    },
    {
      step: 4,
      title: '결과 확인',
      description: '평가 결과를 대시보드에서 확인하고 관리합니다',
      icon: BarChart3,
      action: '대시보드 보기',
      href: '/grading/assignments',
      color: 'orange'
    }
  ];

  const features = [
    {
      icon: CheckCircle,
      title: '자동 평가',
      description: 'AI가 4가지 평가 영역을 자동으로 분석'
    },
    {
      icon: Users,
      title: '학급 관리',
      description: '전체 학생의 성취도를 한눈에 파악'
    },
    {
      icon: FileText,
      title: '개별 리포트',
      description: '학생별 맞춤형 피드백 제공'
    }
  ];

  const handleActionClick = (href) => {
    router.push(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-slate-50 to-purple-50/20">
      {/* Hero Section */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              AI 글쓰기 평가 시스템
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              학생들의 글쓰기를 AI가 분석하여 개별 맞춤형 피드백을 제공합니다.
              간단한 4단계로 평가를 완료하세요.
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-12">
          평가 진행 과정
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            const colorClasses = {
              blue: 'bg-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200',
              green: 'bg-green-500 text-green-600 bg-green-50 hover:bg-green-100 border-green-200',
              purple: 'bg-purple-500 text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200',
              orange: 'bg-orange-500 text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200'
            };
            const colors = colorClasses[step.color].split(' ');
            
            return (
              <div key={index} className="relative">
                {index < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-6 -ml-3">
                    <ArrowRight className="w-6 h-6 text-slate-300" />
                  </div>
                )}
                
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 ${colors[0]} rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-slate-400">
                        STEP {step.step}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {step.description}
                    </p>
                    
                    <button
                      onClick={() => handleActionClick(step.href)}
                      className={`w-full px-4 py-2 rounded-lg ${colors[1]} ${colors[2]} ${colors[3]} border ${colors[4]} transition-colors text-sm font-medium`}
                    >
                      {step.action}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-slate-200/50 p-8 text-center">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            빠른 시작
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/grading/assignments/new')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              새 과제 만들기
            </button>
            <button
              onClick={() => router.push('/grading/assignments')}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              과제 목록 보기
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex p-3 bg-slate-100 rounded-lg mb-3">
                  <Icon className="w-6 h-6 text-slate-600" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-1">{feature.title}</h4>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}