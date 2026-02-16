"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const NTFY_TOPIC = "palmriders-bookings-live";

function BookingCancelledContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (!bookingId) return;
    fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookingId, status: "cancelled" }),
    }).catch((err) => console.error("Failed to update booking:", err));

    if (!notifiedRef.current) {
      notifiedRef.current = true;
      const message = `⚠️ PAYMENT CANCELLED

📋 Booking/Link ID: ${bookingId}
🕐 ${new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" })}

Customer cancelled checkout.`;
      fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: message,
      }).catch((err) => console.error("Failed to send cancelled notification:", err));
    }
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
        {/* Cancel Icon */}
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-amber-600 dark:text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
          Payment Cancelled
        </h1>

        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Your payment was cancelled. Don&apos;t worry - no charges were made to your card.
        </p>

        <div className="space-y-3 text-left bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300">
            What would you like to do?
          </h3>
          <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-2">
            <li className="flex items-start gap-2">
              <span>-</span>
              <span>Try booking again with a different payment method</span>
            </li>
            <li className="flex items-start gap-2">
              <span>-</span>
              <span>Pay with crypto (USDC) for instant confirmation</span>
            </li>
            <li className="flex items-start gap-2">
              <span>-</span>
              <span>Choose &quot;Pay at Pickup&quot; to pay in cash when you arrive</span>
            </li>
            <li className="flex items-start gap-2">
              <span>-</span>
              <span>Contact us if you need help</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/#book"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/#contact"
            className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingCancelledPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300">Loading...</p>
          </div>
        </div>
      }
    >
      <BookingCancelledContent />
    </Suspense>
  );
}
