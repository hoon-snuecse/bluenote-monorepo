'use client';

import { useEffect, useState } from 'react';

export default function FloatingElements() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const elements = [
    // 큰 원 - 좌상단
    {
      shape: 'circle',
      size: 120,
      color: 'from-blue-400/25 to-purple-400/25',
      position: { top: '10%', left: '5%' },
      animation: 'float-1',
      blur: true
    },
    // 작은 삼각형 - 우상단
    {
      shape: 'triangle',
      size: 60,
      color: 'from-pink-400/25 to-orange-400/25',
      position: { top: '15%', right: '10%' },
      animation: 'float-2',
      blur: false
    },
    // 중간 사각형 - 중앙
    {
      shape: 'square',
      size: 80,
      color: 'from-green-400/25 to-blue-400/25',
      position: { top: '40%', right: '20%' },
      animation: 'float-3',
      blur: true
    },
    // 작은 원 - 좌하단
    {
      shape: 'circle',
      size: 50,
      color: 'from-yellow-400/25 to-red-400/25',
      position: { bottom: '30%', left: '15%' },
      animation: 'float-2',
      blur: false
    },
    // 큰 삼각형 - 우하단
    {
      shape: 'triangle',
      size: 100,
      color: 'from-purple-400/25 to-pink-400/25',
      position: { bottom: '20%', right: '8%' },
      animation: 'float-1',
      blur: true
    },
    // 작은 사각형 - 중앙 좌측
    {
      shape: 'square',
      size: 40,
      color: 'from-cyan-400/25 to-blue-400/25',
      position: { top: '60%', left: '10%' },
      animation: 'float-3',
      blur: false
    }
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {elements.map((element, index) => (
        <div
          key={index}
          className={`absolute ${element.blur ? 'blur-xl' : 'blur-sm'}`}
          style={{
            ...element.position,
            animation: `${element.animation} 20s ease-in-out infinite`,
            animationDelay: `${index * 2}s`
          }}
        >
          {element.shape === 'circle' && (
            <div
              className={`rounded-full bg-gradient-to-br ${element.color}`}
              style={{
                width: `${element.size}px`,
                height: `${element.size}px`
              }}
            />
          )}
          {element.shape === 'square' && (
            <div
              className={`bg-gradient-to-br ${element.color} transform rotate-45`}
              style={{
                width: `${element.size}px`,
                height: `${element.size}px`
              }}
            />
          )}
          {element.shape === 'triangle' && (
            <div
              className="relative"
              style={{
                width: 0,
                height: 0,
                borderLeft: `${element.size / 2}px solid transparent`,
                borderRight: `${element.size / 2}px solid transparent`,
                borderBottom: `${element.size}px solid`,
                borderBottomColor: 'currentColor',
                filter: `drop-shadow(0 0 20px rgba(0,0,0,0.1))`
              }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${element.color}`}
                style={{
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  width: `${element.size}px`,
                  height: `${element.size}px`,
                  transform: `translate(-50%, -100%)`,
                  left: '50%'
                }}
              />
            </div>
          )}
        </div>
      ))}

    </div>
  );
}