'use client';

export default function TestSimpleAnimationPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">간단한 애니메이션 테스트</h1>
      
      {/* Tailwind 애니메이션 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">1. Tailwind 기본 애니메이션</h2>
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-blue-500 animate-spin"></div>
          <div className="w-16 h-16 bg-red-500 animate-ping"></div>
          <div className="w-16 h-16 bg-green-500 animate-pulse"></div>
          <div className="w-16 h-16 bg-purple-500 animate-bounce"></div>
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">2. 인라인 CSS 애니메이션</h2>
        <div className="relative h-32">
          <div 
            className="absolute w-16 h-16 bg-orange-500"
            style={{
              animation: 'moveBox 3s ease-in-out infinite'
            }}
          ></div>
        </div>
      </div>

      {/* 정적 SVG */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">3. 정적 SVG (움직이지 않음)</h2>
        <svg width="200" height="100" style={{ border: '1px solid black' }}>
          <rect x="50" y="25" width="100" height="50" fill="blue" />
          <text x="100" y="55" textAnchor="middle" fill="white">SVG 테스트</text>
        </svg>
      </div>

      {/* 애니메이션 SVG */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">4. 애니메이션 SVG</h2>
        <svg width="200" height="100" style={{ border: '1px solid black' }}>
          <circle cx="50" cy="50" r="20" fill="red">
            <animate attributeName="cx" from="50" to="150" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <style jsx>{`
        @keyframes moveBox {
          0% { left: 0; }
          50% { left: 200px; }
          100% { left: 0; }
        }
      `}</style>
    </div>
  );
}