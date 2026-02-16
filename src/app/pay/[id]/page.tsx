"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CryptoPaymentModal } from "@/components/crypto-payment-modal";
import { CreditCard, Smartphone, Bitcoin, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface PaymentLink {
  id: string;
  amount: number;
  description: string;
  customerName?: string;
  customerEmail?: string;
  createdAt: string;
  expiresAt?: string;
  status: "pending" | "paid" | "expired" | "cancelled";
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
}

function PaymentPageContent() {
  const params = useParams();
  const paymentId = params.id as string;

  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    // Load payment link from API
    const loadPaymentLink = async () => {
      try {
        const response = await fetch(`/api/payment-links?id=${paymentId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Payment link not found");
          setIsLoading(false);
          return;
        }

        const link = data.paymentLink;

        // Pre-fill customer info if available
        if (link.customerName) setCustomerName(link.customerName);
        if (link.customerEmail) setCustomerEmail(link.customerEmail);

        setPaymentLink(link);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading payment link:", err);
        setError("Failed to load payment link");
        setIsLoading(false);
      }
    };

    loadPaymentLink();
  }, [paymentId]);

  const updatePaymentStatus = async (
    status: "paid" | "cancelled",
    method?: string,
    transactionId?: string
  ) => {
    if (!paymentLink) return;

    try {
      const response = await fetch("/api/payment-links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: paymentId,
          status,
          paymentMethod: method,
          transactionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentLink(data.paymentLink);
      }
    } catch (err) {
      console.error("Failed to update payment status:", err);
    }
  };

  const handleCreditCardPayment = async () => {
    if (!paymentLink || !customerEmail) {
      alert("Please enter your email address");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: paymentLink.amount,
          bookingId: paymentLink.id,
          customerEmail,
          customerName: customerName || "Customer",
          scooterName: paymentLink.description || "Payment",
          startDate: new Date().toLocaleDateString(),
          endDate: new Date().toLocaleDateString(),
          days: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        // Store payment link ID in session storage for success page
        sessionStorage.setItem("pendingPaymentLinkId", paymentLink.id);
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Credit card payment error:", err);
      alert("Failed to process credit card payment. Please try another method.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGCashPayment = async () => {
    if (!paymentLink || !customerEmail) {
      alert("Please enter your email address");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/create-paymongo-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: paymentLink.amount,
          bookingId: paymentLink.id,
          customerEmail,
          customerName: customerName || "Customer",
          paymentMethod: "gcash",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create GCash payment");
      }

      if (data.checkoutUrl) {
        // Store payment link ID in session storage for success page
        sessionStorage.setItem("pendingPaymentLinkId", paymentLink.id);
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.error("GCash payment error:", err);
      alert("Failed to process GCash payment. Please try another method.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCryptoPayment = () => {
    if (!customerEmail) {
      alert("Please enter your email address");
      return;
    }
    setIsCryptoModalOpen(true);
  };

  const handleCryptoSuccess = async () => {
    await updatePaymentStatus("paid", "crypto");
    setIsCryptoModalOpen(false);
    setPaymentSuccess(true);

    // Send notification
    sendPaymentNotification("crypto");
  };

  const sendPaymentNotification = async (method: string) => {
    if (!paymentLink) return;

    try {
      const message = `💰 PAYMENT RECEIVED!

📋 Payment Link: ${paymentLink.id}
💵 Amount: ₱${paymentLink.amount.toLocaleString()}
📝 Description: ${paymentLink.description || "N/A"}

👤 Customer: ${customerName || "Not provided"}
📧 Email: ${customerEmail || "Not provided"}

💳 Method: ${method.toUpperCase()}
🕐 Time: ${new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" })}

✅ Payment completed successfully!`;

      await fetch("https://ntfy.sh/palmriders-bookings-live", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: message,
      });
    } catch (err) {
      console.error("Failed to send notification:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentLink) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Payment Link Error</h1>
          <p className="text-slate-600 mb-6">{error || "Payment link not found"}</p>
          <Link
            href="/"
            className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (paymentLink.status === "paid" || paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Payment Complete!</h1>
          <p className="text-slate-600 mb-6">Thank you for your payment.</p>

          <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-slate-600">Amount Paid:</span>
              <span className="font-bold text-green-600">₱{paymentLink.amount.toLocaleString()}</span>
            </div>
            {paymentLink.description && (
              <div className="flex justify-between">
                <span className="text-slate-600">For:</span>
                <span className="font-medium text-slate-800">{paymentLink.description}</span>
              </div>
            )}
          </div>

          <Link
            href="/"
            className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Palm Riders
          </Link>
        </div>
      </div>
    );
  }

  if (paymentLink.status === "expired") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Payment Link Expired</h1>
          <p className="text-slate-600 mb-6">
            This payment link has expired. Please contact Palm Riders for a new link.
          </p>
          <Link
            href="/#contact"
            className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-2xl font-bold text-teal-600">Palm Riders</h1>
            <p className="text-slate-500 text-sm">Siargao Scooter Rentals</p>
          </Link>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Amount Header */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white text-center">
            <p className="text-teal-100 text-sm mb-1">Amount to Pay</p>
            <p className="text-4xl font-bold">₱{paymentLink.amount.toLocaleString()}</p>
            {paymentLink.description && (
              <p className="text-teal-100 mt-2">{paymentLink.description}</p>
            )}
          </div>

          <div className="p-6">
            {/* Customer Info */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="juan@example.com"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800"
                />
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700 mb-3">Choose Payment Method:</p>

              {/* Credit Card */}
              <button
                onClick={() => {
                  setSelectedMethod("card");
                  handleCreditCardPayment();
                }}
                disabled={isProcessing || !customerEmail}
                className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl transition-all ${
                  selectedMethod === "card"
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-200 hover:border-teal-300"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-slate-800">Credit / Debit Card</p>
                  <p className="text-sm text-slate-500">Visa, Mastercard, etc.</p>
                </div>
                {isProcessing && selectedMethod === "card" && (
                  <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
                )}
              </button>

              {/* GCash - temporarily hidden, waiting for PayMongo activation */}
              {/* <button
                onClick={() => {
                  setSelectedMethod("gcash");
                  handleGCashPayment();
                }}
                disabled={isProcessing || !customerEmail}
                className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl transition-all ${
                  selectedMethod === "gcash"
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-200 hover:border-teal-300"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-slate-800">GCash</p>
                  <p className="text-sm text-slate-500">Pay with GCash e-wallet</p>
                </div>
                {isProcessing && selectedMethod === "gcash" && (
                  <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
                )}
              </button> */}

              {/* Crypto */}
              <button
                onClick={() => {
                  setSelectedMethod("crypto");
                  handleCryptoPayment();
                }}
                disabled={isProcessing || !customerEmail}
                className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl transition-all ${
                  selectedMethod === "crypto"
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-200 hover:border-teal-300"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Bitcoin className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-slate-800">Cryptocurrency</p>
                  <p className="text-sm text-slate-500">USDC on Ethereum or BSC</p>
                </div>
              </button>
            </div>

            {!customerEmail && (
              <p className="text-sm text-amber-600 mt-4 text-center">
                Please enter your email address to continue
              </p>
            )}

            {/* Security Note */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                🔒 Secure payment powered by Stripe, PayMongo & Web3
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Questions? <Link href="/#contact" className="text-teal-600 hover:underline">Contact us</Link>
          </p>
        </div>
      </div>

      {/* Crypto Payment Modal */}
      <CryptoPaymentModal
        isOpen={isCryptoModalOpen}
        onClose={() => setIsCryptoModalOpen(false)}
        bookingId={paymentLink.id}
        amount={paymentLink.amount}
        customerEmail={customerEmail}
        customerName={customerName || "Customer"}
        onSuccess={handleCryptoSuccess}
        onError={(err) => {
          setIsCryptoModalOpen(false);
          alert(`Crypto payment failed: ${err}`);
        }}
      />
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
