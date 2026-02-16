"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, Suspense } from 'react';

const NTFY_TOPIC = "palmriders-bookings-live";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');

  useEffect(() => {
    if (!bookingId) return;
    const message = `❌ PAYMENT FAILED

📋 Booking/Link ID: ${bookingId}
🕐 ${new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" })}

Customer was not charged. Follow up if needed.`;
    fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: message,
    }).catch((err) => console.error("Failed to send payment-failed notification:", err));
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-4 text-red-600">
            Payment Failed
          </h1>

          {/* Message */}
          <p className="text-xl text-slate-600 mb-8">
            We couldn't process your payment. Don't worry, you haven't been charged.
          </p>

          {/* Booking Details */}
          {bookingId && (
            <div className="bg-red-50 rounded-xl p-6 mb-8 border-2 border-red-200">
              <h2 className="font-semibold text-lg mb-4 text-slate-800">Booking Details</h2>
              <div className="space-y-2 text-slate-700">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-semibold">Booking ID:</span>
                  <span className="font-mono bg-white px-3 py-1 rounded border border-red-300">{bookingId}</span>
                </div>
                <p className="text-sm text-slate-600 mt-4">
                  Your booking has been saved but not confirmed. Please try again to complete the payment.
                </p>
              </div>
            </div>
          )}

          {/* Common Reasons */}
          <div className="bg-yellow-50 rounded-xl p-6 mb-8 border-2 border-yellow-200">
            <h3 className="font-semibold text-lg mb-3 text-slate-800">Common Reasons for Payment Failure</h3>
            <div className="text-left space-y-2 text-sm text-slate-700">
              <div className="flex gap-2">
                <span>•</span>
                <span>Insufficient funds in your account</span>
              </div>
              <div className="flex gap-2">
                <span>•</span>
                <span>Incorrect card details or expired card</span>
              </div>
              <div className="flex gap-2">
                <span>•</span>
                <span>Payment was cancelled or timed out</span>
              </div>
              <div className="flex gap-2">
                <span>•</span>
                <span>Bank declined the transaction</span>
              </div>
              <div className="flex gap-2">
                <span>•</span>
                <span>Network or connectivity issues</span>
              </div>
            </div>
          </div>

          {/* What to Do */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8 border-2 border-blue-200">
            <h3 className="font-semibold text-lg mb-3 text-slate-800">What You Can Do</h3>
            <div className="text-left space-y-3 text-slate-700">
              <div className="flex gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <p className="font-semibold">Try Again</p>
                  <p className="text-sm">Double-check your payment details and try again</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <p className="font-semibold">Use Different Method</p>
                  <p className="text-sm">Try a different payment method (Card, GCash, or Crypto)</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <p className="font-semibold">Contact Us</p>
                  <p className="text-sm">Reach out for assistance via WhatsApp or phone</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mb-8 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">Need help?</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/639457014440"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </a>
              <a
                href="tel:+639457014440"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Us
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            <Link
              href="/#book"
              className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              🔄 Try Again
            </Link>
            <Link
              href="/"
              className="flex-1 bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold py-3 px-6 rounded-lg transition-all"
            >
              🏠 Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailed() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}
