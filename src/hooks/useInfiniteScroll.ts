/*
 * File: src/hooks/useInfiniteScroll.ts
 * SR-DEV: Custom hook for implementing Intersection Observer based infinite scrolling.
 * Industry Best Practice: Uses IntersectionObserver for performance instead of global scroll events.
 */

"use client";

import { useEffect, useRef, RefObject } from 'react';

interface UseInfiniteScrollProps {
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

/**
 * @name useInfiniteScroll
 * @description Attaches an Intersection Observer to a sentinel element to trigger data loading.
 * @param {function} loadMore - Callback function to fetch the next page of data.
 * @param {boolean} hasMore - Flag indicating if there are more items to load.
 * @param {boolean} isLoading - Flag indicating if data is currently being fetched.
 * @returns {React.MutableRefObject<Element>} - Ref to attach to the sentinel element at the bottom of the list.
 */
export default function useInfiniteScroll({ loadMore, hasMore, isLoading }: UseInfiniteScrollProps): RefObject<HTMLDivElement | null> {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 1. Check if we have a sentinel element, more data to fetch, and are not currently loading
    if (!sentinelRef.current || !hasMore || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // 2. Check if the sentinel is intersecting the viewport
        if (entries[0].isIntersecting) {
          // 3. If intersecting, trigger the loadMore callback
          loadMore();
        }
      },
      { 
        // 4. rootMargin: Triggers the observer 100px before the bottom of the viewport
        rootMargin: '100px 0px', 
        threshold: 0.1 
      }
    );

    // Start observing the sentinel element
    observer.observe(sentinelRef.current);

    // Cleanup: Disconnect the observer when the component unmounts or dependencies change
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [loadMore, hasMore, isLoading]);

  return sentinelRef;
}
