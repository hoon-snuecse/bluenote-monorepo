'use client'

export default function TestNavigation() {
  return (
    <div className="p-4 bg-gray-100">
      <h2 className="text-lg font-bold mb-4">네비게이션 테스트</h2>
      <div className="space-y-2">
        <a 
          href="http://localhost:3000" 
          className="block p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Web 앱으로 이동 (localhost:3000)
        </a>
        <a 
          href="http://localhost:3002" 
          className="block p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Grading 앱으로 이동 (localhost:3002)
        </a>
      </div>
    </div>
  )
}