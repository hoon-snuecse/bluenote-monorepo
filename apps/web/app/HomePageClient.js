'use client';

import { useEffect, useState } from 'react';
import TypingAnimation from './components/TypingAnimation';
import FloatingElements from './components/FloatingElements';
import SimpleNav from './components/SimpleNav';

export default function HomePageClient() {
  const [fadeIn, setFadeIn] = useState({
    hero: false,
    subtitle: false,
    description: false,
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
      text: "A teacher who is attempting to teach without inspiring the pupil with a desire to learn is hammering on cold iron.",
      translation: "학생에게 배우고자 하는 열망을 불어넣지 않고 가르치려는 교사는 차가운 철을 두드리는 것과 같다.",
      author: "Horace Mann",
      source: "Lectures on Education (1845)"
    }
  ];

  useEffect(() => {
    const timers = [
      setTimeout(() => setFadeIn(prev => ({ ...prev, hero: true })), 100),
      setTimeout(() => setFadeIn(prev => ({ ...prev, subtitle: true })), 600),
      setTimeout(() => setFadeIn(prev => ({ ...prev, description: true })), 900),
      setTimeout(() => setFadeIn(prev => ({ ...prev, quote1: true })), 1200),
      setTimeout(() => setFadeIn(prev => ({ ...prev, quote2: true })), 1500),
      setTimeout(() => setFadeIn(prev => ({ ...prev, quote3: true })), 1800),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  return (
    <>
      <SimpleNav />
      <div className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        {/* Floating Elements Background */}
        <FloatingElements />
        
        {/* Main Content */}
        <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="container-custom text-center">
            {/* Main Title with Typing Animation */}
            <h1 className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-space-grotesk font-bold mb-6 transition-all duration-1000 ${
              fadeIn.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <span className="bg-gradient-to-br from-slate-900 to-blue-600 bg-clip-text text-transparent">
                BlueNote Atelier
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className={`text-xl sm:text-2xl md:text-3xl text-slate-600 mb-12 font-medium transition-all duration-1000 ${
              fadeIn.subtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <TypingAnimation 
                text="Where Ideas Come to Life" 
                delay={600}
                speed={100}
              />
            </p>
            
            {/* Description */}
            <p className={`text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 ${
              fadeIn.description ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              미완성된 생각들이 살아 숨쉬는 공간. 교육연구와 일상의 창조적 작업이 만나는 곳.
            </p>
          </div>
        </section>

        {/* Quotes Section */}
        <section className="py-20 px-4">
          <div className="container-custom max-w-7xl">
            <div className="grid md:grid-cols-3 gap-8">
              {quotes.map((quote, index) => (
                <div 
                  key={index}
                  className={`quote-sheet transition-all duration-1000 ${
                    fadeIn[`quote${index + 1}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  <div className="relative h-full">
                    {/* Dashed border effect */}
                    <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col">
                      <blockquote className="flex-1">
                        <p className="text-base text-slate-700 mb-4 leading-relaxed italic">
                          "{quote.text}"
                        </p>
                        <p className="text-sm text-slate-600 mb-6">
                          {quote.translation}
                        </p>
                      </blockquote>
                      
                      <footer className="mt-auto">
                        <cite className="text-sm">
                          <div className="font-semibold text-slate-800">
                            {quote.author}
                          </div>
                          <div className="text-slate-500 text-xs mt-1">
                            {quote.source}
                          </div>
                        </cite>
                      </footer>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
    </>
  );
}