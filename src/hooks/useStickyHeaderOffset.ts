/*
 * File: src/hooks/useStickyHeaderOffset.ts
 * SR-DEV: Custom hook to calculate the vertical offset for sticky elements.
 * Purpose: Ensures elements stick right below the smart-hiding Header (H: 64px).
 * Industry Best Practice: Decouple the UI element from magic numbers.
 */

"use client";

import { useState, useEffect } from 'react';

// The fixed height of the site header (H: 16 * 4px = 64px)
const HEADER_HEIGHT = 64; 

type ScrollDirection = 'up' | 'down';

interface UseStickyHeaderOffsetReturn {
  offset: string;
  direction: ScrollDirection;
  height: number;
  transition: string;
}

export default function useStickyHeaderOffset(): UseStickyHeaderOffsetReturn {
    // Offset state (0px or 64px)
    const [headerOffset, setHeaderOffset] = useState<number>(HEADER_HEIGHT);
    const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('up'); 

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const updateScrollDir = () => {
            const scrollY = window.scrollY;

            // Logic mirrors the Header.tsx hide/show behavior:
            // 1. At the very top OR scrolling up: Header is visible. Sticky content must move down.
            if (scrollY < 50 || scrollY < lastScrollY) {
                setHeaderOffset(HEADER_HEIGHT);
                setScrollDirection('up');
            } 
            // 2. Scrolling down and past the top margin: Header is hidden. Sticky content should stick to 0.
            else {
                setHeaderOffset(0);
                setScrollDirection('down');
            }

            lastScrollY = scrollY > 0 ? scrollY : 0;
        };

        window.addEventListener('scroll', updateScrollDir);
        
        // Initial check
        updateScrollDir(); 

        return () => window.removeEventListener('scroll', updateScrollDir);
    }, []);

    // Return the offset as a CSS string (e.g., '64px' or '0px')
    return {
        offset: `${headerOffset}px`,
        direction: scrollDirection,
        height: HEADER_HEIGHT,
        // The transition is for smooth UI movement when the offset changes
        transition: 'top 300ms ease-in-out', 
    };
}
