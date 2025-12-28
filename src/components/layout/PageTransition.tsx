import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [shouldFadeIn, setShouldFadeIn] = useState(true);
  const prevPathnameRef = useRef<string>(location.pathname);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip transition on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevPathnameRef.current = location.pathname;
      return undefined;
    }

    // Only animate if pathname actually changed
    if (prevPathnameRef.current === location.pathname) {
      return undefined;
    }

    prevPathnameRef.current = location.pathname;

    // Reset to opacity 0, then fade in - defer state updates
    const resetTimer = setTimeout(() => {
      setShouldFadeIn(false);
    }, 0);

    const fadeInTimer = setTimeout(() => {
      setShouldFadeIn(true);
    }, 20);

    return () => {
      clearTimeout(resetTimer);
      clearTimeout(fadeInTimer);
    };
  }, [location.pathname]);

  return (
    <div className={`h-full ${shouldFadeIn ? 'animate-fade-in' : 'opacity-0'}`}>
      {children}
    </div>
  );
};
