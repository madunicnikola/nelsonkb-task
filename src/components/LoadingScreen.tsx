'use client';

import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  message?: string;
  onComplete?: () => void;
  minLoadingTime?: number;
}

export default function LoadingScreen({ 
  message = "Loading models", 
  onComplete, 
  minLoadingTime = 1000 
}: LoadingScreenProps) {
  const [dots, setDots] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const checkComplete = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= minLoadingTime) {
        onComplete?.();
      } else {
        setTimeout(checkComplete, minLoadingTime - elapsed);
      }
    };

    checkComplete();
  }, [onComplete, isMounted, startTime, minLoadingTime]);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-xl mb-4">{message}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] text-white">
      <div className="text-xl mb-4">{message}{dots}</div>
    </div>
  );
} 