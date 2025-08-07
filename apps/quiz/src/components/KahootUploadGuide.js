'use client'

import { Upload, ExternalLink } from 'lucide-react'

export default function KahootUploadGuide({ className = "" }) {
  return (
    <div className={`bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Upload className="w-8 h-8 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            📝 Kahoot에 퀴즈 업로드하는 방법
          </h3>
          
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="font-semibold text-purple-600 mr-2">1.</span>
              <div>
                <p className="font-medium">Kahoot 로그인</p>
                <a 
                  href="https://kahoot.com/schools/how-it-works/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1 mt-1"
                >
                  Kahoot.com 접속하기
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </li>
            
            <li className="flex items-start">
              <span className="font-semibold text-purple-600 mr-2">2.</span>
              <div>
                <p className="font-medium">파일 다운로드</p>
                <p className="text-gray-600 mt-1">상단의 <span className="font-semibold text-green-600">Excel</span> 또는 <span className="font-semibold text-blue-600">CSV</span> 다운로드 버튼 클릭</p>
              </div>
            </li>
            
            <li className="flex items-start">
              <span className="font-semibold text-purple-600 mr-2">3.</span>
              <div>
                <p className="font-medium">새 Kahoot 만들기</p>
                <p className="text-gray-600 mt-1">상단 메뉴에서 "Create" → "Import spreadsheet" 선택</p>
              </div>
            </li>
            
            <li className="flex items-start">
              <span className="font-semibold text-purple-600 mr-2">4.</span>
              <div>
                <p className="font-medium">다운로드한 파일 업로드</p>
                <p className="text-gray-600 mt-1">다운로드한 Excel 또는 CSV 파일을 드래그 앤 드롭</p>
              </div>
            </li>
            
            <li className="flex items-start">
              <span className="font-semibold text-purple-600 mr-2">5.</span>
              <div>
                <p className="font-medium">퀴즈 설정 및 저장</p>
                <p className="text-gray-600 mt-1">파일 업로드 후 (제목, 설명, 표지 이미지 등을 설정하고) "Save" 클릭</p>
              </div>
            </li>
            
            <li className="flex items-start">
              <span className="font-semibold text-purple-600 mr-2">6.</span>
              <div>
                <p className="font-medium">퀴즈 실행</p>
                <p className="text-gray-600 mt-1">"Play" 버튼을 눌러 학생들과 함께 퀴즈 시작!</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}