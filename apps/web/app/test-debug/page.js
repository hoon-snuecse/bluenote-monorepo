'use client';

import { useState } from 'react';

export default function TestDebugPage() {
  const [opacity, setOpacity] = useState(0.08);
  const [color, setColor] = useState('blue');

  console.log('TestDebugPage rendering with:', { opacity, color });

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">디버그 테스트 페이지</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">설정 테스트</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              투명도: {opacity.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.03"
              max="0.15"
              step="0.01"
              value={opacity}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value);
                console.log('Opacity changed to:', newValue);
                setOpacity(newValue);
              }}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              색상: {color}
            </label>
            <select
              value={color}
              onChange={(e) => {
                console.log('Color changed to:', e.target.value);
                setColor(e.target.value);
              }}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="blue">파란색</option>
              <option value="red">빨간색</option>
              <option value="green">초록색</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">SVG 테스트</h2>
        
        <svg 
          width="200" 
          height="200" 
          viewBox="0 0 200 200"
          style={{
            opacity: opacity,
            stroke: color === 'blue' ? 'rgba(0, 0, 255, 0.5)' : 
                   color === 'red' ? 'rgba(255, 0, 0, 0.5)' : 
                   'rgba(0, 255, 0, 0.5)',
            fill: 'none'
          }}
        >
          <rect x="50" y="50" width="100" height="100" strokeWidth="2"/>
          <circle cx="100" cy="100" r="40" strokeWidth="2"/>
          <text x="100" y="105" textAnchor="middle" fontSize="14" fill={color}>
            테스트
          </text>
        </svg>
        
        <p className="mt-4 text-sm text-gray-600">
          위의 SVG가 설정에 따라 변경되는지 확인하세요.
        </p>
      </div>
    </div>
  );
}