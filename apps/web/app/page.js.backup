'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [fadeIn, setFadeIn] = useState({
    hero: false,
    quote1: false,
    quote2: false,
    quote3: false,
  });

  const quotes = [
    {
      text: "There is nothing so practical as a good theory.",
      translation: "좋은 이론만큼 실용적인 것은 없다.",
      author: "Kurt Lewin",
      source: "Field Theory in Social Science: Selected Theoretical Papers (1951)"
    },
    {
      text: "Knowledge emerges only through invention and re-invention, through the restless, impatient, continuing, hopeful inquiry human beings pursue in the world, with the world, and with each other.",
      translation: "지식은 발명과 재발명을 통해, 인간이 세상에서, 세상과 함께, 서로와 함께 추구하는 끊임없고 조급하고 지속적이고 희망적인 탐구를 통해서만 생겨난다.",
      author: "Paulo Freire",
      source: "Pedagogy of the Oppressed: 30th Anniversary Edition (2014)"
    },
    {
      text: "Education is the most powerful weapon which you can use to change the world.",
      translation: "교육은 세상을 바꾸는 데 사용할 수 있는 가장 강력한 무기이다.",
      author: "Nelson Mandela",
      source: "Long Walk to Freedom (1994)"
    }
  ];

  useEffect(() => {
    // Stagger the fade-in animations
    const timers = [
      setTimeout(() => setFadeIn(prev => ({ ...prev, hero: true })), 100),
      setTimeout(() => setFadeIn(prev => ({ ...prev, quote1: true })), 500),
      setTimeout(() => setFadeIn(prev => ({ ...prev, quote2: true })), 700),
      setTimeout(() => setFadeIn(prev => ({ ...prev, quote3: true })), 900),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`py-24 px-4 text-center transition-all duration-1000 ${
        fadeIn.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="container-custom">
          <h1 className="text-5xl md:text-6xl font-space-grotesk font-bold mb-6 bg-gradient-to-br from-slate-900 to-blue-600 bg-clip-text text-transparent">
            BlueNote Atelier
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-8 font-medium">
            미완성된 생각들이 살아 숨쉬는 공간
          </p>
          
          <p className="text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed">
            우리는 완벽한 답 대신 <strong className="text-slate-700">더 나은 질문을 만들어갑니다</strong>. 
            철학자들이 연구 노트에 불완전한 아이디어를 기록하듯, 건축가들이 청사진에 미래의 건물을 그려내듯, 
            지향점을 가지고 미래를 그려나갑니다.
          </p>
        </div>
      </section>

      {/* Quotes Section */}
      <section className="py-16 px-4">
        <div className="container-custom space-y-8">
          {quotes.map((quote, index) => (
            <div
              key={index}
              className={`quote-sheet transition-all duration-1000 ${
                fadeIn[`quote${index + 1}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="relative">
                {/* Dashed border effect */}
                <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
                
                <div className="relative z-10">
                  <p className="text-lg text-slate-700 italic mb-4 leading-relaxed">
                    "{quote.text}"
                  </p>
                  
                  <p className="text-base text-slate-500 mb-6 leading-relaxed">
                    {quote.translation}
                  </p>
                  
                  <div className="flex items-center gap-2 text-blue-600 font-semibold mb-2">
                    <span className="w-5 h-px bg-blue-300"></span>
                    <span>{quote.author}</span>
                  </div>
                  
                  <p className="text-sm text-slate-400 italic">
                    {quote.source}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


    </div>
  );
}