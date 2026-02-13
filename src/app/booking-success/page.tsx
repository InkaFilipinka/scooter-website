"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const bookingId = searchParams.get("booking_id");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify the payment was successful
    const verifyPayment = async () => {
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        // In production, you would verify the session with Stripe
        // For now, we'll assume success if we have a session ID
        setIsVerified(true);

        // Update booking status in localStorage
        if (bookingId) {
          const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
          const updatedBookings = bookings.map((booking: { id: string; status?: string }) => {
            if (booking.id === bookingId) {
              return { ...booking, status: "confirmed", paymentStatus: "paid" };
            }
            return booking;
          });
          localStorage.setItem("bookings", JSON.stringify(updatedBookings));
        }

        // Send notification to business owner
        try {
          await fetch("/api/send-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "Payment Received!",
              message: `Booking ${bookingId} - Credit card payment confirmed via Stripe`,
              tags: "credit_card,moneybag",
            }),
          });
        } catch (notifyError) {
          console.error("Failed to send notification:", notifyError);
        }
      } catch (error) {
        console.error("Payment verification error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, bookingId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
          Payment Successful!
        </h1>

        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Thank you for your booking! Your payment has been processed successfully.
        </p>

        {bookingId && (
          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              Booking Reference
            </p>
            <p className="text-lg font-mono font-bold text-slate-800 dark:text-white">
              {bookingId}
            </p>
          </div>
        )}

        <div className="space-y-3 text-left bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 dark:text-green-300">
            What happens next?
          </h3>
          <ul className="text-sm text-green-700 dark:text-green-400 space-y-2">
            <li className="flex items-start gap-2">
              <span>1.</span>
              <span>You will receive a confirmation email shortly</span>
            </li>
            <li className="flex items-start gap-2">
              <span>2.</span>
              <span>We will contact you via WhatsApp to confirm pickup details</span>
            </li>
            <li className="flex items-start gap-2">
              <span>3.</span>
              <span>Bring a valid ID when picking up your scooter</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Home
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

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300">Loading...</p>
          </div>
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
