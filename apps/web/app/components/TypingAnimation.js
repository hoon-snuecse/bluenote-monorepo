'use client';

import { useEffect, useState } from 'react';

export default function TypingAnimation({ text, className = '', delay = 0 }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex === 0) {
      // Initial delay before typing starts
      const initialTimer = setTimeout(() => {
        setCurrentIndex(1);
      }, delay);
      return () => clearTimeout(initialTimer);
    }

    if (currentIndex <= text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex));
        setCurrentIndex(currentIndex + 1);
      }, 100); // Typing speed

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, delay]);

  return (
    <h1 className={`${className} bg-gradient-to-br from-slate-900 to-blue-600 bg-clip-text text-transparent`}>
      {displayText}
      <span className={`inline-block w-[3px] h-[1.2em] ml-1 bg-blue-600 ${
        currentIndex <= text.length ? 'animate-pulse' : 'opacity-0'
      }`} />
    </h1>
  );
}