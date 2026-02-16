"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import emailjs from '@emailjs/browser';
import { addOns } from '@/data/add-ons';

const NTFY_TOPIC = "palmriders-bookings-live";

interface BookingData {
  id: string;
  name: string;
  email: string;
  phone: string;
  scooter: string;
  startDate: string;
  endDate: string;
  pickupTime: number;
  delivery: string;
  distance: string;
  deliveryLocation: string;
  insurance: string;
  surfRack: string;
  paymentOption: string;
  paymentMethod: string;
  addOns: string[];
  total: number;
  status: string;
  timestamp: string;
}

// Format time from 24h number to display string
const formatTime = (hour: number): string => {
  if (hour === 0) return "12:00 AM";
  if (hour === 12) return "12:00 PM";
  if (hour > 12) return `${hour - 12}:00 PM`;
  return `${hour}:00 AM`;
};

// Get insurance label
const getInsuranceLabel = (insurance: string): string => {
  if (insurance === "full") return "Full Coverage";
  if (insurance === "limited") return "Limited Coverage";
  return "No Insurance";
};

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const bookingId = searchParams.get("booking_id");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const notificationsSentRef = useRef(false);

  useEffect(() => {
    // Verify the payment and send notifications
    const verifyPaymentAndNotify = async () => {
      if (!sessionId || !bookingId) {
        setIsLoading(false);
        return;
      }

      // Prevent duplicate notifications
      if (notificationsSentRef.current) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/bookings?id=${encodeURIComponent(bookingId)}`);
        const data = await res.json();
        const foundBooking = data.booking as BookingData | undefined;

        if (foundBooking) {
          setBooking(foundBooking);

          let amount_paid: number | undefined;
          try {
            const sessionRes = await fetch(`/api/stripe-session?session_id=${encodeURIComponent(sessionId!)}`);
            if (sessionRes.ok) {
              const sessionData = await sessionRes.json();
              amount_paid = sessionData.amount_paid;
            }
          } catch (_) { /* use booking total if session fetch fails */ }
          if (amount_paid == null) amount_paid = foundBooking.total;

          await fetch("/api/bookings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: bookingId,
              status: "confirmed",
              paymentStatus: "paid",
              amount_paid,
              payment_method: "Card",
              payment_reference: sessionId,
            }),
          });

          notificationsSentRef.current = true;
          await sendNotifications(foundBooking);
        } else if (bookingId.startsWith("PAY-")) {
          // Payment link (admin-generated) paid via Stripe
          const linkRes = await fetch(`/api/payment-links?id=${encodeURIComponent(bookingId)}`);
          const linkData = await linkRes.json();
          const paymentLink = linkData.paymentLink;
          if (paymentLink) {
            await fetch("/api/payment-links", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: bookingId,
                status: "paid",
                paymentMethod: "card",
              }),
            });
            notificationsSentRef.current = true;
            const msg = `💰 PAYMENT LINK PAID (Card)

📋 Link ID: ${paymentLink.id}
💵 Amount: ₱${paymentLink.amount.toLocaleString()}
📝 ${paymentLink.description || "N/A"}
👤 ${paymentLink.customerName || "—"} | ${paymentLink.customerEmail || "—"}
🕐 ${new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" })}
✅ Stripe payment successful.`;
            await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
              method: "POST",
              mode: "no-cors",
              headers: { "Content-Type": "text/plain" },
              body: msg,
            });
          }
        }

        setIsVerified(true);
      } catch (error) {
        console.error("Payment verification error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyPaymentAndNotify();
  }, [sessionId, bookingId]);

  const sendNotifications = async (bookingData: BookingData) => {
    // EmailJS Configuration
    const SERVICE_ID = 'service_64m9p4r';
    const TEMPLATE_ID_CUSTOMER = 'template_eab09xr';
    const TEMPLATE_ID_BUSINESS = 'template_7nltdt4';
    const PUBLIC_KEY = 'hwMh8cnLQ3tvlI9QI';

    // Get scooter name (simplified - you might want to import scooter data)
    const scooterNames: Record<string, string> = {
      'honda-beat': 'Honda Beat',
      'honda-click': 'Honda Click',
      'yamaha-fazzio': 'Yamaha Fazzio'
    };
    const scooterName = scooterNames[bookingData.scooter] || bookingData.scooter;

    // Format dates
    const startDate = new Date(bookingData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endDate = new Date(bookingData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Calculate rental days
    const days = Math.ceil((new Date(bookingData.endDate).getTime() - new Date(bookingData.startDate).getTime()) / (1000 * 60 * 60 * 24));

    // Build delivery info
    let deliveryInfo = "Pickup at store";
    if (bookingData.delivery === "yes") {
      deliveryInfo = `Yes - ${bookingData.distance}km away`;
      if (bookingData.deliveryLocation) {
        deliveryInfo += `\nLocation: ${bookingData.deliveryLocation}`;
      }
    }

    // Calculate insurance cost
    let insuranceCost = 0;
    if (bookingData.insurance === "full") insuranceCost = 100 * days;
    else if (bookingData.insurance === "limited") insuranceCost = 50 * days;

    // Build add-ons list: resolve IDs to names and prices
    const addOnsList = (bookingData.addOns?.length ?? 0) > 0
      ? bookingData.addOns!
          .map((id) => {
            const addOn = addOns.find((a) => a.id === id);
            if (!addOn) return '';
            const price = addOn.perDay ? addOn.price * days : addOn.price;
            return `${addOn.icon} ${addOn.name}${price > 0 ? ` - ₱${price}` : ' (FREE)'}`;
          })
          .filter(Boolean)
          .join(', ')
      : 'None';

    // 1. Send ntfy.sh notification with full booking details
    try {
      const notificationMessage = `🛵 NEW BOOKING - PALM RIDERS 🌴
💳 PAID VIA STRIPE (Credit Card)

📋 Booking ID: ${bookingData.id}

👤 CUSTOMER INFO
Name: ${bookingData.name}
Email: ${bookingData.email}
Phone: ${bookingData.phone}

🛵 RENTAL DETAILS
Scooter: ${scooterName}
Start: ${startDate}
End: ${endDate}
Days: ${days}
Pickup Time: ${formatTime(bookingData.pickupTime)}
Delivery: ${bookingData.delivery === "yes" ? `Yes (${bookingData.distance}km away)` : "Pickup at store"}
Insurance: ${getInsuranceLabel(bookingData.insurance)} (₱${insuranceCost})
Surf Rack: ${bookingData.surfRack === "yes" ? "Yes (FREE)" : "No"}
Add-ons: ${addOnsList}

💰 PAYMENT
Method: Credit Card (Stripe)
Status: PAID ✅
Total: ₱${bookingData.total}

⚡ Contact customer to confirm pickup!`;

      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: notificationMessage,
      });

      console.log('✅ Booking notification sent to ntfy.sh!');
    } catch (error) {
      console.error('❌ Error sending ntfy notification:', error);
    }

    // 2. Send EmailJS notifications
    try {
      const for_our_team = `ADD-ONS: ${addOnsList}\n\nPAYMENT:\nTotal: ₱${bookingData.total}\nAmount paid: ₱${bookingData.total}`;

      const emailData = {
        booking_id: bookingData.id,
        for_our_team,
        customer_name: bookingData.name,
        customer_email: bookingData.email,
        customer_phone: bookingData.phone,
        scooter_name: scooterName,
        start_date: startDate,
        end_date: endDate,
        pickup_time: formatTime(bookingData.pickupTime),
        delivery: deliveryInfo,
        insurance: `${getInsuranceLabel(bookingData.insurance)} - ₱${insuranceCost}`,
        surf_rack: bookingData.surfRack === "yes" ? "Yes (FREE)" : "No",
        add_ons: addOnsList,
        payment_option: "Pay in Full",
        payment_method: "Credit Card (Stripe)",
        amount_to_pay: bookingData.total,
        total_cost: bookingData.total,
        deposit_amount: 0,
        balance_owed: 0,
        timestamp: new Date().toLocaleString(),
        business_email: 'contact@siargaoscooterrentals.com',
      };

      // Send to business owner
      await emailjs.send(SERVICE_ID, TEMPLATE_ID_BUSINESS, emailData, PUBLIC_KEY);
      console.log('✅ Business email sent!');

      // Send to customer
      await emailjs.send(SERVICE_ID, TEMPLATE_ID_CUSTOMER, emailData, PUBLIC_KEY);
      console.log('✅ Customer confirmation email sent!');
    } catch (error) {
      console.error('❌ Failed to send emails:', error);
    }
  };

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

        {/* Booking Details Summary */}
        {booking && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">
              Booking Summary
            </h3>
            <div className="space-y-2 text-sm text-green-700 dark:text-green-400">
              <div className="flex justify-between">
                <span>Scooter:</span>
                <span className="font-medium">{booking.scooter}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Paid:</span>
                <span className="font-bold">₱{booking.total}</span>
              </div>
            </div>
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
