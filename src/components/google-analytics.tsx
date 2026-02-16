"use client";
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
// Google Analytics Measurement ID - Replace with your actual GA4 ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
// Track page views
export function pageview(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}
// Track custom events
export function event({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}
// Track booking form submissions
export function trackBookingSubmission(scooter: string, days: number, total: number) {
  event({
    action: 'booking_submitted',
    category: 'Booking',
    label: scooter,
    value: total,
  });
}
// Track payment method selection
export function trackPaymentMethod(method: string) {
  event({
    action: 'payment_method_selected',
    category: 'Payment',
    label: method,
  });
}
// Track add-ons selection
export function trackAddOnSelection(addOn: string) {
  event({
    action: 'add_on_selected',
    category: 'Booking',
    label: addOn,
  });
}
// Track WhatsApp click
export function trackWhatsAppClick() {
  event({
    action: 'whatsapp_click',
    category: 'Contact',
    label: 'WhatsApp Button',
  });
}
// Track phone call click
export function trackPhoneClick() {
  event({
    action: 'phone_click',
    category: 'Contact',
    label: 'Phone Button',
  });
}
// Component to track page views
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      pageview(url);
    }
  }, [pathname, searchParams]);
  return null;
}
export function GoogleAnalytics() {
  // Don't load GA in development
  if (process.env.NODE_ENV === 'development') {
    return null;
  }
  // Don't load if no GA ID is set
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    return null;
  }
  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
      {/* Page view tracker wrapped in Suspense */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
