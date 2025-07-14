'use client';

import { useEffect, useState } from 'react';

export default function TypingAnimation({ text, className = '', delay = 0, speed = 100 }) {
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
      }, speed); // Typing speed

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, delay, speed]);

  return (
    <span className={className}>
      {displayText}
      <span className={`inline-block w-[3px] h-[1.2em] ml-1 bg-current ${
        currentIndex <= text.length ? 'animate-pulse' : 'opacity-0'
      }`} />
    </span>
  );
}