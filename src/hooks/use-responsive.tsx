import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Breakpoint;
  screenWidth: number;
  screenHeight: number;
  isPortrait: boolean;
  isLandscape: boolean;
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    breakpoint: 'xs',
    screenWidth: 0,
    screenHeight: 0,
    isPortrait: true,
    isLandscape: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let breakpoint: Breakpoint;
      if (width < 640) breakpoint = 'xs';
      else if (width < 768) breakpoint = 'sm';
      else if (width < 1024) breakpoint = 'md';
      else if (width < 1280) breakpoint = 'lg';
      else if (width < 1536) breakpoint = 'xl';
      else breakpoint = '2xl';

      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      const isPortrait = height >= width;
      const isLandscape = width > height;

      setState({
        isMobile,
        isTablet,
        isDesktop,
        breakpoint,
        screenWidth: width,
        screenHeight: height,
        isPortrait,
        isLandscape,
      });
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return state;
}
