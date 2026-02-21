"use client";

import Script from "next/script";

/**
 * Google Reviews widget (Elfsight).
 * Set NEXT_PUBLIC_ELFSIGHT_WIDGET_ID in .env
 */
const elfsightWidgetId = process.env.NEXT_PUBLIC_ELFSIGHT_WIDGET_ID;

export function GoogleReviewsWidget() {
  if (!elfsightWidgetId) {
    return null;
  }

  return (
    <>
      <Script
        src="https://elfsightcdn.com/platform.js"
        strategy="afterInteractive"
      />
      <div className={`${elfsightWidgetId} min-h-[200px]`} />
    </>
  );
}
