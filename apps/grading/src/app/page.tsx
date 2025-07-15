import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          AI 글쓰기 평가 시스템
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">환영합니다!</h2>
          <p className="text-gray-600 mb-6">
            이 시스템은 AI를 활용하여 학생들의 글쓰기를 평가하고 
            개인별 맞춤 피드백을 제공합니다.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/assignments"
              className="block p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">교사용</h3>
              <p className="text-gray-600">
                과제 생성, 학생 글 수집, AI 평가 실행, 리포트 확인
              </p>
            </Link>
            
            <Link
              href="/submit"
              className="block p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">학생용</h3>
              <p className="text-gray-600">
                과제 제출 링크를 통해 글쓰기 제출
              </p>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-4">주요 기능</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>AI 기반 4개 영역 평가 (논리성, 창의성, 표현력, 완성도)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>개인별 성장 단계 시각화 및 맞춤형 피드백</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>학급 전체 분석 대시보드</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>Google Drive 연동 및 대량 평가</span>
            </li>
          </ul>
        </div>
        
        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            시작하기
          </Link>
        </div>
      </div>
    </div>
  );
}