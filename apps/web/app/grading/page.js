'use client';

import Link from 'next/link';
import { PenTool, FileText, Users, BarChart } from 'lucide-react';

export default function GradingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container-custom py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            AI 글쓰기 평가 시스템
          </h1>
          <p className="text-xl text-slate-600">
            학생들의 글쓰기를 AI가 분석하고 개별 맞춤형 피드백을 제공합니다
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <PenTool className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">자동 평가</h3>
            <p className="text-slate-600 text-sm">
              AI가 글쓰기를 4가지 영역으로 분석하여 자동 평가
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <FileText className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">개별 리포트</h3>
            <p className="text-slate-600 text-sm">
              각 학생별 상세한 평가 리포트 생성
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Users className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">학급 관리</h3>
            <p className="text-slate-600 text-sm">
              전체 학급의 성취도를 한눈에 파악
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <BarChart className="w-12 h-12 text-orange-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">데이터 분석</h3>
            <p className="text-slate-600 text-sm">
              평가 결과를 다양한 형태로 분석 및 내보내기
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 inline-block">
            <p className="text-yellow-800 mb-4">
              이 기능은 현재 개발 중입니다. 곧 서비스를 제공할 예정입니다.
            </p>
            <Link 
              href="/prg" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              ← 프로그램 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}