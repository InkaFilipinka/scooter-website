"use client";

import Script from "next/script";
import { useRef, useState, useEffect } from "react";

/**
 * Google Reviews widget (Elfsight).
 * Loads only when reviews section scrolls into view to avoid slowing initial page load.
 * Set NEXT_PUBLIC_ELFSIGHT_WIDGET_ID in .env
 */
const elfsightWidgetId = process.env.NEXT_PUBLIC_ELFSIGHT_WIDGET_ID;

export function GoogleReviewsWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!elfsightWidgetId || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!elfsightWidgetId) {
    return null;
  }

  return (
    <div ref={containerRef} className="min-h-[200px]">
      {isInView && (
        <>
          <Script
            src="https://elfsightcdn.com/platform.js"
            strategy="lazyOnload"
          />
          <div className={`${elfsightWidgetId} min-h-[200px]`} />
        </>
      )}
    </div>
  );
}
