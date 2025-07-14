'use client';

export default function TestSVGPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold p-8">SVG 렌더링 테스트</h1>
      
      {/* 1. 인라인 SVG 테스트 */}
      <div className="p-8">
        <h2 className="text-lg font-semibold mb-4">1. 기본 인라인 SVG</h2>
        <svg width="200" height="200" style={{ border: '1px solid black' }}>
          <rect x="50" y="50" width="100" height="100" fill="blue" opacity="0.5" />
          <text x="100" y="100" textAnchor="middle" fill="red">테스트</text>
        </svg>
      </div>

      {/* 2. 절대 위치 SVG 테스트 */}
      <div className="p-8">
        <h2 className="text-lg font-semibold mb-4">2. 절대 위치 SVG</h2>
        <div className="relative h-64 bg-white border-2 border-gray-300">
          <svg 
            className="absolute"
            style={{ top: '10px', left: '10px', opacity: 0.8 }}
            width="150" 
            height="150"
          >
            <circle cx="75" cy="75" r="50" fill="green" />
          </svg>
          <p className="absolute bottom-4 left-4">상대 위치 컨테이너 내부</p>
        </div>
      </div>

      {/* 3. Fixed 위치 SVG 테스트 */}
      <div className="p-8">
        <h2 className="text-lg font-semibold mb-4">3. Fixed 위치 SVG (우측 하단에 표시)</h2>
        <svg 
          className="fixed"
          style={{ 
            bottom: '20px', 
            right: '20px', 
            opacity: 0.5,
            zIndex: 100,
            border: '2px solid red'
          }}
          width="100" 
          height="100"
        >
          <rect x="10" y="10" width="80" height="80" fill="purple" />
          <text x="50" y="50" textAnchor="middle" fill="white">Fixed</text>
        </svg>
      </div>

      {/* 4. 스타일 속성 테스트 */}
      <div className="p-8">
        <h2 className="text-lg font-semibold mb-4">4. 다양한 스타일 속성</h2>
        <svg 
          width="300" 
          height="100"
          style={{
            stroke: 'rgba(30, 58, 138, 0.3)',
            fill: 'rgba(30, 58, 138, 0.05)',
            opacity: 0.8
          }}
        >
          <rect x="10" y="10" width="280" height="80" strokeWidth="2" />
          <text x="150" y="50" textAnchor="middle" fill="rgba(30, 58, 138, 0.8)">
            스타일 테스트
          </text>
        </svg>
      </div>

      {/* 5. Z-index 레이어 테스트 */}
      <div className="p-8">
        <h2 className="text-lg font-semibold mb-4">5. Z-index 레이어 테스트</h2>
        <div className="relative h-64 bg-gray-200">
          <div className="absolute inset-0 z-0 bg-red-200 opacity-50">
            <p>Z-0 레이어</p>
          </div>
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="bg-white p-4 shadow-lg">
              <p>Z-10 레이어 (콘텐츠)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}