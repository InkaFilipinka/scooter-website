"use client";

import { useState, useEffect, useRef } from "react";
import { MapPicker } from "./map-picker";
import { CryptoPaymentModal } from "./crypto-payment-modal";
import { AddOnsModal } from "./add-ons-modal";
import { MapPin, Clock } from "lucide-react";
import emailjs from '@emailjs/browser';
import { addOns } from "@/data/add-ons";
import { getPricePerDay, getPricingTierLabel } from "@/data/scooter-pricing";
import { trackBookingSubmission, trackPaymentMethod, trackAddOnSelection } from "./google-analytics";

const NTFY_TOPIC = "palmriders-bookings-live";

interface Scooter {
  id: string;
  name: string;
  image: string;
  price: number;
  features: string[];
  alt?: string;
}

interface SavedBooking {
  id: string;
  [key: string]: unknown;
}

export function BookingForm({ scooters }: { scooters: Scooter[] }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    scooter: "",
    startDate: "",
    endDate: "",
    pickupTime: 13, // Default 1pm (range: 8-22 for 8am-10pm)
    insurance: "full", // full, limited, none
    delivery: "no",
    distance: "",
    deliveryLocation: "", // Place name from search
    surfRack: "no",
    paymentOption: "full",
    paymentMethod: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);
  const [isAddOnsModalOpen, setIsAddOnsModalOpen] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showDeliveryError, setShowDeliveryError] = useState(false);
  const [showDeliveryDepositModal, setShowDeliveryDepositModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<string>('');
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [atCapacity, setAtCapacity] = useState(false);

  const sectionContactRef = useRef<HTMLDivElement>(null);
  const sectionDatesRef = useRef<HTMLDivElement>(null);
  const sectionPaymentRef = useRef<HTMLDivElement>(null);
  const formTopRef = useRef<HTMLFormElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | HTMLFormElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Close success modal and reset form
  const handleCloseSuccessModal = () => {
    setSubmitted(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      scooter: "",
      startDate: "",
      endDate: "",
      pickupTime: 13,
      insurance: "full",
      delivery: "no",
      distance: "",
      deliveryLocation: "",
      surfRack: "no",
      paymentOption: "full",
      paymentMethod: "",
    });
    setSelectedCoords(null);
    setSelectedAddOns([]);
    setCurrentBookingId('');
  };

  // Format time from 24h number to display string (e.g., 10 -> "10:00 AM", 14 -> "2:00 PM")
  const formatTime = (hour: number): string => {
    if (hour === 0) return "12:00 AM";
    if (hour === 12) return "12:00 PM";
    if (hour > 12) return `${hour - 12}:00 PM`;
    return `${hour}:00 AM`;
  };

  // Get tomorrow's date for min date validation
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get minimum end date (day after start date)
  const getMinEndDate = () => {
    if (!formData.startDate) return getTomorrowDate();
    const startDate = new Date(formData.startDate);
    startDate.setDate(startDate.getDate() + 1);
    return startDate.toISOString().split('T')[0];
  };

  // Validate date range
  const validateDates = (startDate: string, endDate: string): string | null => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if start date is in the past
    if (start <= today) {
      return "Start date must be at least tomorrow";
    }

    // Check if end date is before or same as start date
    if (end <= start) {
      return "End date must be after start date";
    }

    // Check for maximum rental period (optional - 90 days)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 90) {
      return "Maximum rental period is 90 days. Contact us for longer rentals.";
    }

    return null;
  };

  // Effect to validate dates when they change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const error = validateDates(formData.startDate, formData.endDate);
      setDateError(error);
    } else {
      setDateError(null);
    }
  }, [formData.startDate, formData.endDate]);

  // Effect to check stock availability for selected dates
  useEffect(() => {
    if (!formData.startDate || !formData.endDate || dateError) {
      setAtCapacity(false);
      return;
    }
    const check = async () => {
      try {
        const res = await fetch(
          `/api/bookings?start=${encodeURIComponent(formData.startDate)}&end=${encodeURIComponent(formData.endDate)}`
        );
        const data = await res.json();
        if (res.ok && data.atCapacity) setAtCapacity(true);
        else setAtCapacity(false);
      } catch {
        setAtCapacity(false);
      }
    };
    check();
  }, [formData.startDate, formData.endDate, dateError]);

  // Check if delivery options should be enabled
  const canSelectDelivery = () => {
    return formData.scooter && formData.startDate && formData.endDate;
  };

  // Handle delivery button click
  const handleDeliveryClick = (deliveryType: "yes" | "no") => {
    if (!canSelectDelivery()) {
      setShowDeliveryError(true);
      return;
    }
    setShowDeliveryError(false);

    if (deliveryType === "yes") {
      setShowDeliveryDepositModal(true);
      return;
    }

    // Switching to pickup
    setFormData({
      ...formData,
      delivery: "no",
      distance: "",
      deliveryLocation: "",
    });
    setSelectedCoords(null);
  };

  const confirmDeliveryDeposit = () => {
    setShowDeliveryDepositModal(false);
    const newPaymentOption = formData.paymentOption === "pickup" ? "full" : formData.paymentOption;
    setFormData({
      ...formData,
      delivery: "yes",
      paymentOption: newPaymentOption,
    });
    setIsMapOpen(true);
  };

  const processPayment = async (bookingId: string, amount: number) => {
    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      console.log('💰 processPayment called with amount:', amount);

      // CRITICAL VALIDATION: Ensure amount is valid
      if (!amount || amount <= 0 || isNaN(amount)) {
        throw new Error(`Invalid payment amount: ${amount}. Please refresh and try again.`);
      }

      const paymentData = {
        amount,
        bookingId,
        customerEmail: formData.email,
        customerName: formData.name,
      };

      console.log('💳 Payment data:', paymentData);

      // Route to appropriate payment gateway based on payment method
      if (formData.paymentMethod === 'gcash') {
        // Use PayMongo for GCash
        const response = await fetch('/api/create-paymongo-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...paymentData, paymentMethod: 'gcash' }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Payment failed');
        }

        // Redirect to GCash checkout
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return true;
        }

      } else if (formData.paymentMethod === 'crypto') {
        // Use MetaMask for direct USDC payments (6% fees built in)
        console.log('🔐 Opening crypto modal with amount:', amount);

        // CRITICAL: Verify amount before opening modal
        if (amount <= 0) {
          throw new Error(`Cannot open crypto payment with amount: ${amount}. Please check your booking details.`);
        }

        setCurrentBookingId(bookingId);
        setIsCryptoModalOpen(true);
        setIsProcessingPayment(false);
        // Payment will be handled by the crypto modal
        return 'pending';

      } else if (formData.paymentMethod === 'credit-card') {
        // Use Stripe Checkout - redirect to Stripe's hosted payment page
        const scooter = scooters.find((s) => s.id === formData.scooter);
        const scooterName = scooter?.name || "Scooter";
        const days = getRentalDays();
        const startDate = new Date(formData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const endDate = new Date(formData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...paymentData,
            scooterName,
            startDate,
            endDate,
            days,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create checkout session');
        }

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
          return 'redirect'; // Special value to indicate redirect in progress
        } else {
          throw new Error('No checkout URL received from Stripe');
        }
      }

      return false;

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error instanceof Error ? error.message : 'Payment processing failed');
      return false;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill in all required fields: Name, Email, and Phone Number");
      scrollToSection(sectionContactRef);
      return;
    }

    if (!formData.scooter) {
      alert("Please select a scooter model.");
      scrollToSection(sectionContactRef);
      return;
    }

    // Validate date range
    if (dateError) {
      alert(dateError);
      scrollToSection(sectionDatesRef);
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      alert("Please select start and end dates.");
      scrollToSection(sectionDatesRef);
      return;
    }

    // Show add-ons modal before proceeding to payment
    setPendingSubmit(true);
    setIsAddOnsModalOpen(true);
  };

  const handleAddOnsConfirm = async (selectedAddOnIds: string[]) => {
    setSelectedAddOns(selectedAddOnIds);
    setIsAddOnsModalOpen(false);

    // Track add-ons selection in Google Analytics
    selectedAddOnIds.forEach(addOnId => {
      const addOn = addOns.find(a => a.id === addOnId);
      if (addOn) {
        trackAddOnSelection(addOn.name);
      }
    });

    if (!pendingSubmit) return;
    setPendingSubmit(false);

    if (formData.paymentOption !== "pickup" && !formData.paymentMethod) {
      alert("Please select a payment method.");
      scrollToSection(sectionPaymentRef);
      return;
    }

    // Create booking object (total = full rental amount so PDF always shows correct total)
    const fullTotal = Math.round(calculateTotal());
    const booking = {
      id: `BK-${Date.now()}`,
      ...formData,
      addOns: selectedAddOnIds,
      total: fullTotal,
      amount_paid: 0,
      payment_method: formData.paymentOption === "pickup" ? "Pay at collection (cash)" : "",
      payment_reference: "",
      status: "pending" as const,
      timestamp: new Date().toISOString(),
    };

    // Save to Netlify Blobs via API
    const createRes = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking),
    });
    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      alert(err.error || "Failed to save booking. Please try again.");
      scrollToSection(formTopRef);
      return;
    }

    // Get scooter details
    const scooter = scooters.find((s) => s.id === formData.scooter);
    const scooterName = scooter?.name || "Scooter";

    // Format dates
    const startDate = new Date(formData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endDate = new Date(formData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Handle pay-at-pickup option (no payment processing needed)
    if (formData.paymentOption === "pickup") {
      // No payment required - just send notifications
      await sendNotifications(booking.id, scooterName, startDate, endDate);

      // Track booking submission in Google Analytics
      const days = Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24));
      trackBookingSubmission(scooterName, days, calculateTotal());

      setSubmitted(true);
      // Don't auto-close - let user close manually
      return;
    }

    // Process payment for online payment options
    const paymentResult = await processPayment(booking.id, getPaymentAmount());

    // If crypto, wait for modal to complete payment
    if (formData.paymentMethod === 'crypto') {
      // Modal will handle payment, so don't proceed yet
      return;
    }

    // If credit card, user is being redirected to Stripe Checkout
    if (paymentResult === 'redirect') {
      // Stripe Checkout will handle payment, don't proceed
      return;
    }

    if (!paymentResult && paymentError) {
      // Payment failed, mark booking as cancelled in backend
      await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: booking.id, status: "cancelled" }),
      });
      alert(`Payment failed: ${paymentError}`);
      scrollToSection(sectionPaymentRef);
      return;
    }

    // Send automated email and WhatsApp notifications
    await sendNotifications(booking.id, scooterName, startDate, endDate);

    // Track booking submission in Google Analytics
    const days = Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24));
    trackBookingSubmission(scooterName, days, getPaymentAmount());

    setSubmitted(true);
    // Don't auto-close - let user close manually
  };

  // Handler for successful crypto payment from modal
  const handleCryptoPaymentSuccess = async (txHash?: string) => {
    await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: currentBookingId,
        status: "confirmed",
        paymentStatus: "paid",
        amount_paid: Math.round(getPaymentAmount()),
        payment_method: "Crypto",
        payment_reference: txHash ?? "",
      }),
    });

    const scooter = scooters.find((s) => s.id === formData.scooter);
    const scooterName = scooter?.name || "Scooter";
    const startDate = new Date(formData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endDate = new Date(formData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    await sendNotifications(currentBookingId, scooterName, startDate, endDate);

    setSubmitted(true);
    setIsCryptoModalOpen(false);
  };

  const sendNotifications = async (bookingId: string, scooterName: string, startDate: string, endDate: string) => {
    // EmailJS Configuration
    const SERVICE_ID = 'service_64m9p4r'; // Updated to new service
    const TEMPLATE_ID_CUSTOMER = 'template_eab09xr';
    const TEMPLATE_ID_BUSINESS = 'template_7nltdt4';
    const PUBLIC_KEY = 'hwMh8cnLQ3tvlI9QI';

    // Build delivery location string with all details
    let deliveryInfo = "Pickup at store";
    if (formData.delivery === "yes") {
      deliveryInfo = `Yes - ${formData.distance}km away`;
      if (formData.deliveryLocation) {
        // If place name exists (from search), include it
        deliveryInfo += `\nLocation: ${formData.deliveryLocation}`;
      }
      if (selectedCoords) {
        // Always include coordinates
        deliveryInfo += `\nCoordinates: ${selectedCoords.lat.toFixed(6)}, ${selectedCoords.lng.toFixed(6)}`;
        deliveryInfo += `\nGoogle Maps: https://www.google.com/maps?q=${selectedCoords.lat},${selectedCoords.lng}`;
      }
    }

    // Build add-ons list
    const days = getRentalDays();
    const addOnsList = selectedAddOns.length > 0
      ? selectedAddOns.map(id => {
          const addOn = addOns.find(a => a.id === id);
          if (!addOn) return '';
          const price = addOn.perDay ? addOn.price * days : addOn.price;
          return `${addOn.icon} ${addOn.name} - ₱${price}${addOn.perDay ? ` (₱${addOn.price}/day × ${days} days)` : ''}`;
        }).join('\n')
      : "None";

    const totalCost = calculateTotal();
    const amountNow = getPaymentAmount();
    const depositAmount = formData.paymentOption === "deposit" ? amountNow : 0;
    const balanceOwed = formData.paymentOption === "deposit" ? Math.round(totalCost - depositAmount) : 0;

    const addOnsListForEmail = selectedAddOns.length > 0
      ? selectedAddOns.map(id => {
          const addOn = addOns.find(a => a.id === id);
          if (!addOn) return '';
          const price = addOn.perDay ? addOn.price * days : addOn.price;
          return `${addOn.name} - ₱${price}`;
        }).join(', ')
      : "None";

    const paymentBreakdown =
      formData.paymentOption === "deposit"
        ? `Total: ₱${totalCost}\nDeposit paid: ₱${depositAmount}\nBalance owed on pickup: ₱${balanceOwed}`
        : `Total: ₱${totalCost}\nAmount paid: ₱${amountNow}`;

    const for_our_team = `ADD-ONS: ${addOnsListForEmail}\n\nPAYMENT:\n${paymentBreakdown}`;

    const emailData = {
      booking_id: bookingId,
      for_our_team,
      customer_name: formData.name,
      customer_email: formData.email,
      customer_phone: formData.phone,
      scooter_name: scooterName,
      start_date: startDate,
      end_date: endDate,
      pickup_time: formatTime(formData.pickupTime),
      delivery: deliveryInfo,
      insurance: `${getInsuranceLabel()} - ₱${calculateInsuranceCost()}`,
      surf_rack: formData.surfRack === "yes" ? "Yes (FREE)" : "No",
      add_ons: addOnsList,
      payment_option: formData.paymentOption === "full" ? "Pay in Full" : formData.paymentOption === "pickup" ? "Pay at Pickup" : "Deposit",
      payment_method: formData.paymentMethod || "Pay at Pickup",
      amount_to_pay: amountNow,
      total_cost: totalCost,
      deposit_amount: depositAmount,
      balance_owed: balanceOwed,
      timestamp: new Date().toLocaleString(),
      business_email: 'contact@siargaoscooterrentals.com',
    };

    try {
      // Build simple add-ons list
      const addOnsListSimple = selectedAddOns.length > 0
        ? selectedAddOns.map(id => {
            const addOn = addOns.find(a => a.id === id);
            if (!addOn) return '';
            const price = addOn.perDay ? addOn.price * days : addOn.price;
            return `${addOn.name} (₱${price})`;
          }).join(', ')
        : "None";

      const paymentOptionLabel = formData.paymentOption === "full" ? "Pay in Full" : formData.paymentOption === "pickup" ? "Pay at Pickup" : "Deposit";
      const paymentLines = formData.paymentOption === "deposit"
        ? `Option: ${paymentOptionLabel}
Method: ${formData.paymentMethod || "—"}
Total: ₱${totalCost}
Deposit paid: ₱${depositAmount}
Balance owed on pickup: ₱${balanceOwed}`
        : `Option: ${paymentOptionLabel}
Method: ${formData.paymentMethod || "Pay at Pickup"}
Amount now: ₱${amountNow}
Total: ₱${totalCost}`;

      const notificationMessage = `🛵 NEW BOOKING - PALM RIDERS 🌴

📋 Booking ID: ${bookingId}

👤 CUSTOMER INFO
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}

🛵 RENTAL DETAILS
Scooter: ${scooterName}
Start: ${startDate}
End: ${endDate}
Pickup Time: ${formatTime(formData.pickupTime)}
Delivery: ${formData.delivery === "yes" ? `Yes (${formData.distance}km away)` : "Pickup at store"}
Insurance: ${getInsuranceLabel()} (₱${calculateInsuranceCost()})
Surf Rack: ${formData.surfRack === "yes" ? "Yes (FREE)" : "No"}
Add-ons: ${addOnsListSimple}

💰 PAYMENT
${paymentLines}

⚡ Contact customer to confirm!`;

      // Send notification directly to ntfy.sh
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: notificationMessage,
      });

      console.log('✅ Booking notification sent to ntfy.sh!');
    } catch (error) {
      console.error('❌ Error sending booking notification:', error);
    }

    try {
      // Send email notifications
      await emailjs.send(SERVICE_ID, TEMPLATE_ID_BUSINESS, emailData, PUBLIC_KEY);
      await emailjs.send(SERVICE_ID, TEMPLATE_ID_CUSTOMER, emailData, PUBLIC_KEY);
      console.log('✅ Emails sent successfully!');
    } catch (error) {
      console.error('❌ Failed to send emails:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === "range" ? Number(value) : value,
    });

    // Track payment method selection in Google Analytics
    if (name === 'paymentMethod' && value) {
      trackPaymentMethod(value);
    }
  };

  const getRentalDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateAddOnsTotal = () => {
    const days = getRentalDays();
    return selectedAddOns.reduce((total, id) => {
      const addOn = addOns.find(a => a.id === id);
      if (!addOn) return total;
      return total + (addOn.perDay ? addOn.price * days : addOn.price);
    }, 0);
  };

  // Calculate insurance cost based on selection
  const calculateInsuranceCost = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const days = getRentalDays();
    if (formData.insurance === "full") return 100 * days;
    if (formData.insurance === "limited") return 50 * days;
    return 0; // No insurance
  };

  // Get insurance label for display
  const getInsuranceLabel = () => {
    if (formData.insurance === "full") return "Full Coverage";
    if (formData.insurance === "limited") return "Limited Coverage";
    return "No Insurance";
  };

  const calculateTotal = () => {
    if (!formData.scooter || !formData.startDate || !formData.endDate) return 0;

    const days = getRentalDays();
    const pricePerDay = getPricePerDay(formData.scooter, days);
    let total = pricePerDay * days;

    // Add insurance cost
    total += calculateInsuranceCost();

    // Delivery fee - ₱12.50/km round trip, minimum ₱100 per delivery
    if (formData.delivery === "yes" && formData.distance) {
      const distance = Number.parseFloat(formData.distance);
      const feeByDistance = distance * 12.5 * 2; // 12.5 pesos per km, round trip
      total += Math.max(100, feeByDistance);
    }

    // Add selected add-ons (only paid ones add to total)
    total += calculateAddOnsTotal();

    return Math.round(total);
  };

  // Get current price per day based on rental duration
  const getCurrentPricePerDay = () => {
    if (!formData.scooter || !formData.startDate || !formData.endDate) return 0;
    const days = getRentalDays();
    return getPricePerDay(formData.scooter, days);
  };

  // Delivery fee amount: ₱12.50/km round trip, minimum ₱100
  const getDeliveryFee = () => {
    if (formData.delivery !== "yes" || !formData.distance) return 0;
    const distance = Number.parseFloat(formData.distance);
    return Math.max(100, Math.round(distance * 12.5 * 2));
  };

  const calculateDeposit = () => {
    if (!formData.scooter || !formData.startDate || !formData.endDate) return 0;
    const days = getRentalDays();
    const pricePerDay = getPricePerDay(formData.scooter, days);
    return Math.round(pricePerDay); // One day rent at the current tier rate
  };

  const getPaymentAmount = () => {
    if (formData.paymentOption === "pickup") {
      return 0; // Pay at pickup - no payment now
    }
    if (formData.paymentOption === "deposit") {
      return Math.round(calculateDeposit());
    }
    return Math.round(calculateTotal());
  };

  const handleLocationSelect = (location: { lat: number; lng: number; distance: number; placeName?: string }) => {
    setSelectedCoords({ lat: location.lat, lng: location.lng });
    setFormData({
      ...formData,
      distance: location.distance.toString(),
      deliveryLocation: location.placeName || "", // Store place name if provided
    });
  };

  return (
    <>
      <MapPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
      <CryptoPaymentModal
        isOpen={isCryptoModalOpen}
        onClose={() => setIsCryptoModalOpen(false)}
        bookingId={currentBookingId}
        amount={getPaymentAmount()}
        customerEmail={formData.email}
        customerName={formData.name}
        onSuccess={handleCryptoPaymentSuccess}
        onError={(errMsg: string) => {
          setPaymentError(errMsg);
          setIsCryptoModalOpen(false);
          setIsProcessingPayment(false);
        }}
      />
      <AddOnsModal
        isOpen={isAddOnsModalOpen}
        onClose={() => {
          setIsAddOnsModalOpen(false);
          setPendingSubmit(false);
        }}
        onConfirm={handleAddOnsConfirm}
        rentalDays={getRentalDays()}
      />
      {/* Delivery deposit requirement popup */}
      {showDeliveryDepositModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
            <p className="text-slate-800 dark:text-slate-200 font-medium mb-6">
              If you pick Delivery option a minimum payment of 1 day as deposit is required.
            </p>
            <button
              type="button"
              onClick={confirmDeliveryDeposit}
              className="w-full px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors"
            >
              I understand
            </button>
          </div>
        </div>
      )}
      <form ref={formTopRef} onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="text-sm font-semibold mb-2 dark:text-slate-700">We Accept</div>
        <div className="flex flex-wrap gap-3 items-center text-sm text-slate-600 dark:text-slate-700">
          <span className="flex items-center gap-1">
            💳 Credit Card
          </span>
          <span className="flex items-center gap-1">
            ₿ Crypto
          </span>
          {/* GCash temporarily hidden - waiting for PayMongo activation */}
          {/* <span className="flex items-center gap-1">
            📱 GCash
          </span> */}
          <span className="flex items-center gap-1 text-teal-600 font-semibold">
            🏪 Pay at Pickup
          </span>
        </div>
      </div>
      {/* Free Inclusions */}
      <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border-2 border-teal-200">
        <div className="text-sm font-semibold mb-2 text-teal-800">🎁 FREE with Every Rental:</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-teal-700">
          <div className="flex items-center gap-2">
            <span>📱</span>
            <span>Phone Holder</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🪖</span>
            <span>Extra Helmet</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🎓</span>
            <span>30-Min Lesson</span>
          </div>
        </div>
        <div className="text-xs text-teal-600 mt-2">
          + FREE customer pick up or deliver to our shop in General Luna area!
        </div>
      </div>
      <div ref={sectionContactRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold mb-2 dark:text-slate-700">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-slate-700"
            placeholder="Juan Dela Cruz"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold mb-2 dark:text-slate-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-slate-700"
            placeholder="juan@example.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold mb-2 dark:text-slate-700">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-slate-700"
            placeholder="+63 123 456 7890"
          />
        </div>

        <div>
          <label htmlFor="scooter" className="block text-sm font-semibold mb-2 dark:text-slate-700">
            Scooter Model
          </label>
          <select
            id="scooter"
            name="scooter"
            required
            value={formData.scooter}
            onChange={(e) => {
              handleChange(e);
              if (showDeliveryError) setShowDeliveryError(false);
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-slate-700 ${
              showDeliveryError && !formData.scooter
                ? "border-red-500 border-2"
                : "border-slate-300"
            }`}
          >
            <option value="">Select a scooter</option>
            {scooters.map((scooter) => (
              <option key={scooter.id} value={scooter.id}>
                {scooter.name}
              </option>
            ))}
          </select>
        </div>

        <div ref={sectionDatesRef}>
          <label htmlFor="startDate" className="block text-sm font-semibold mb-2 dark:text-slate-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            required
            min={getTomorrowDate()}
            value={formData.startDate}
            onChange={(e) => {
              handleChange(e);
              if (showDeliveryError) setShowDeliveryError(false);
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-slate-700 ${
              showDeliveryError && !formData.startDate
                ? "border-red-500 border-2"
                : "border-slate-300"
            }`}
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-semibold mb-2 dark:text-slate-700">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            required
            min={getMinEndDate()}
            value={formData.endDate}
            onChange={(e) => {
              handleChange(e);
              if (showDeliveryError) setShowDeliveryError(false);
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-slate-700 ${
              showDeliveryError && !formData.endDate
                ? "border-red-500 border-2"
                : "border-slate-300"
            }`}
          />
        </div>
      </div>

      {/* Date validation error */}
      {dateError && (
        <div className="mb-4 p-3 bg-red-50 border-2 border-red-400 rounded-lg text-red-700 text-sm">
          {dateError}
        </div>
      )}

      {/* Pickup Time Slider */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <label htmlFor="pickupTime" className="block text-sm font-semibold mb-3 dark:text-slate-700 flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-600" />
          {formData.delivery === "yes" ? "Delivery Time" : "Pickup Time"}
        </label>

        {/* Time Display */}
        <div className="text-center mb-4">
          <div className="inline-block bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg">
            <span className="text-2xl font-bold">{formatTime(formData.pickupTime)}</span>
          </div>
        </div>

        {/* Slider */}
        <div className="px-2">
          <input
            type="range"
            id="pickupTime"
            name="pickupTime"
            min={8}
            max={22}
            step={1}
            value={formData.pickupTime}
            onChange={handleChange}
            className="time-slider w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />

          {/* Time Markers */}
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>8 AM</span>
            <span>12 PM</span>
            <span>4 PM</span>
            <span>8 PM</span>
            <span>10 PM</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 mt-3 text-center">
          {formData.delivery === "yes"
            ? "We'll deliver your scooter at this time"
            : "Visit our shop at this time to pick up your scooter"}
        </div>
      </div>

      {/* Insurance Coverage Section */}
      {formData.scooter && formData.startDate && formData.endDate && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🛡️</span>
            <label className="text-sm font-semibold dark:text-slate-700">Insurance Coverage</label>
          </div>

          <div className="space-y-3">
            {/* Full Coverage */}
            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.insurance === "full"
                ? "border-teal-500 bg-gradient-to-r from-teal-50 to-emerald-50 shadow-md"
                : "border-slate-200 hover:border-teal-300 bg-white"
            }`}>
              <input
                type="radio"
                name="insurance"
                value="full"
                checked={formData.insurance === "full"}
                onChange={handleChange}
                className="mt-1 mr-3 accent-teal-600"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-800">Full Coverage</div>
                  <div className="font-bold text-teal-600">₱100/day</div>
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  No deductible
                  <span className="ml-2 text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full">Most Popular</span>
                </div>
              </div>
            </label>

            {/* Limited Coverage */}
            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.insurance === "limited"
                ? "border-teal-500 bg-gradient-to-r from-teal-50 to-emerald-50 shadow-md"
                : "border-slate-200 hover:border-teal-300 bg-white"
            }`}>
              <input
                type="radio"
                name="insurance"
                value="limited"
                checked={formData.insurance === "limited"}
                onChange={handleChange}
                className="mt-1 mr-3 accent-teal-600"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-800">Limited Coverage</div>
                  <div className="font-bold text-teal-600">₱50/day</div>
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  ₱3,000 deductible
                </div>
              </div>
            </label>

            {/* No Insurance */}
            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.insurance === "none"
                ? "border-orange-500 bg-orange-50 shadow-md"
                : "border-slate-200 hover:border-orange-300 bg-white"
            }`}>
              <input
                type="radio"
                name="insurance"
                value="none"
                checked={formData.insurance === "none"}
                onChange={handleChange}
                className="mt-1 mr-3 accent-orange-600"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-800">No Insurance</div>
                  <div className="font-bold text-slate-600">₱0/day</div>
                </div>
                <div className="text-sm text-orange-600 mt-1">
                  Full responsibility for any damages
                </div>
              </div>
            </label>
          </div>

          {/* Insurance Cost Display */}
          {getRentalDays() > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>{getInsuranceLabel()} ({getRentalDays()} days)</span>
                <span className="font-semibold">₱{calculateInsuranceCost()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3 dark:text-slate-700">Need Delivery Service?</label>
        <div className="text-xs text-teal-600 mb-2">
          ₱12.50/km (round trip) · <strong>Minimum ₱100</strong> per delivery (e.g. 1 km = ₱100)
        </div>
        {showDeliveryError && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg border-2 border-red-500">
            Please select scooter model, start date, and end date first
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleDeliveryClick("no")}
            aria-label="Pick up scooter at Palm Riders location"
            className={`px-6 py-4 rounded-lg font-semibold transition-all ${
              formData.delivery === "no"
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg"
                : "bg-white border-2 border-slate-300 text-slate-700 dark:text-slate-800 hover:border-teal-300"
            }`}
          >
            No, I'll pick it up from Palm Riders
          </button>
          <button
            type="button"
            onClick={() => handleDeliveryClick("yes")}
            aria-label="Request delivery service"
            className={`px-6 py-4 rounded-lg font-semibold transition-all ${
              formData.delivery === "yes"
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg"
                : "bg-white border-2 border-slate-300 text-slate-700 dark:text-slate-800 hover:border-teal-300"
            }`}
          >
            Yes, deliver to me
          </button>
        </div>
      </div>

      {formData.delivery === "yes" && (
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Delivery Distance
          </label>

          {/* Map Picker Button */}
          <button
            type="button"
            onClick={() => setIsMapOpen(true)}
            aria-label="Open map to select delivery location"
            className="w-full px-4 py-3 border-2 border-teal-500 text-teal-600 hover:bg-teal-50 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <MapPin className="w-5 h-5" />
            {formData.distance ? `🎯 Selected: ${formData.distance} km away` : "🗺️ Click to Select Location on Map"}
          </button>

          {formData.distance && selectedCoords && (
            <div className="mt-2 text-sm text-slate-600">
              Coordinates: {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}
            </div>
          )}
        </div>
      )}

      {atCapacity && formData.startDate && formData.endDate && (
        <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
          <p className="text-sm font-medium text-amber-900">
            ⚠️ We’re at full capacity for these dates. You can still book – <strong>WhatsApp confirmation is required</strong>. Opening hours: <strong>10am–10pm (Philippine time)</strong>.
          </p>
        </div>
      )}

      {formData.scooter && formData.startDate && formData.endDate && (
        <div className="mb-6 p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg border-2 border-teal-200 shadow-md">
          <div className="text-lg font-semibold mb-2 flex items-center gap-2 dark:text-slate-800">
            <span>💰</span>
            Estimated Total
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent dark:text-slate-800 dark:bg-none">₱{calculateTotal()}</div>

          {/* Pickup/Delivery Time Info */}
          <div className="text-sm text-slate-700 mt-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>
              {formData.delivery === "yes" ? "Delivery" : "Pickup"} at <strong className="text-teal-700">{formatTime(formData.pickupTime)}</strong>
            </span>
          </div>

          {/* Pricing Tier Info */}
          <div className="text-sm text-teal-700 dark:text-teal-800 mt-2 p-2 bg-white/50 rounded-lg">
            <div className="flex justify-between">
              <span>{getRentalDays()} days × ₱{getCurrentPricePerDay()}/day</span>
              <span className="font-semibold">₱{getRentalDays() * getCurrentPricePerDay()}</span>
            </div>
            <div className="text-xs text-teal-600 mt-1">
              Rate tier: {getPricingTierLabel(getRentalDays())} {getRentalDays() >= 28 && "✨"}
            </div>
          </div>

          {/* Insurance Cost Info */}
          <div className="text-sm text-slate-600 dark:text-slate-700 mt-2 flex items-center gap-2">
            <span>🛡️</span>
            <span>
              {getInsuranceLabel()}: <strong>₱{calculateInsuranceCost()}</strong>
              {formData.insurance !== "none" && ` (₱${formData.insurance === "full" ? 100 : 50}/day)`}
            </span>
          </div>

          {/* Delivery Fee Info */}
          {formData.delivery === "yes" && formData.distance && (
            <div className="text-sm text-slate-600 dark:text-slate-700 mt-2">
              <span>Delivery fee: ₱{getDeliveryFee()} (₱12.50/km, min. ₱100)</span>
            </div>
          )}
          {selectedAddOns.length > 0 && (
            <div className="text-sm text-slate-600 dark:text-slate-700 mt-2">
              <div className="font-semibold">Selected Add-ons (+₱{calculateAddOnsTotal()}):</div>
              <ul className="ml-4 mt-1 space-y-1">
                {selectedAddOns.map(id => {
                  const addOn = addOns.find(a => a.id === id);
                  if (!addOn) return null;
                  const days = getRentalDays();
                  const price = addOn.perDay ? addOn.price * days : addOn.price;
                  return (
                    <li key={id}>
                      {addOn.icon} {addOn.name} - ₱{price}
                      {addOn.perDay && ` (₱${addOn.price}/day)`}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Payment Options */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3 dark:text-slate-700">Payment Option</label>
        <div className="space-y-3">
          {/* Pay in Full Option - Highlighted by default */}
          <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
            formData.paymentOption === "full"
              ? "border-teal-500 bg-gradient-to-r from-teal-50 to-emerald-50 shadow-md"
              : "border-slate-200 hover:border-teal-300"
          }`}>
            <input
              type="radio"
              name="paymentOption"
              value="full"
              checked={formData.paymentOption === "full"}
              onChange={handleChange}
              className="mt-1 mr-3 accent-teal-600"
            />
            <div className="flex-1">
              <div className={`font-semibold flex items-center gap-2 ${formData.paymentOption === "full" ? "text-teal-700" : "text-slate-700"}`}>
                <span>💳</span>
                Pay in Full Online
              </div>
              <div className={`text-sm mt-1 ${formData.paymentOption === "full" ? "text-teal-600" : "text-slate-600"}`}>
                Complete payment now - Total: ₱{calculateTotal()}
              </div>
            </div>
          </label>
          {/* Pay at Pickup Option - Only for store pickup */}
          {formData.delivery === "no" && (
            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.paymentOption === "pickup"
                ? "border-teal-500 bg-gradient-to-r from-teal-50 to-emerald-50 shadow-md"
                : "border-slate-200 hover:border-teal-300"
            }`}>
              <input
                type="radio"
                name="paymentOption"
                value="pickup"
                checked={formData.paymentOption === "pickup"}
                onChange={handleChange}
                className="mt-1 mr-3 accent-teal-600"
              />
              <div className="flex-1">
                <div className={`font-semibold flex items-center gap-2 ${formData.paymentOption === "pickup" ? "text-teal-700" : "text-slate-700"}`}>
                  <span>🏪</span>
                  Pay at Pickup (No Payment Now)
                </div>
                <div className={`text-sm mt-1 ${formData.paymentOption === "pickup" ? "text-teal-600" : "text-slate-600"}`}>
                  Reserve now, pay ₱{calculateTotal()} at {formatTime(formData.pickupTime)} when you pick up
                  <br />
                  <span className="text-xs">Cash or GCash accepted at pickup</span>
                </div>
              </div>
            </label>
          )}
          {/* Pay Deposit Option */}
          <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
            formData.paymentOption === "deposit"
              ? "border-teal-500 bg-gradient-to-r from-teal-50 to-emerald-50 shadow-md"
              : "border-slate-200 hover:border-teal-300"
          }`}>
            <input
              type="radio"
              name="paymentOption"
              value="deposit"
              checked={formData.paymentOption === "deposit"}
              onChange={handleChange}
              className="mt-1 mr-3 accent-teal-600"
            />
            <div className="flex-1">
              <div className={`font-semibold flex items-center gap-2 ${formData.paymentOption === "deposit" ? "text-teal-700" : "text-slate-700"}`}>
                <span>💵</span>
                Pay Deposit to Reserve
              </div>
              <div className={`text-sm mt-1 ${formData.paymentOption === "deposit" ? "text-teal-600" : "text-slate-600"}`}>
                Reserve now with deposit (1 day rent): ₱{calculateDeposit()}
                <br />
                <span className="text-xs">Balance of ₱{Math.round(calculateTotal() - calculateDeposit())} due on pickup. Cash or GCash only</span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Payment Method - Only show if paying online */}
      {formData.paymentOption !== "pickup" && (
        <div ref={sectionPaymentRef} className="mb-6">
          <label htmlFor="paymentMethod" className="block text-sm font-semibold mb-2 dark:text-slate-700">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            required={formData.paymentOption !== "pickup"}
            value={formData.paymentMethod}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-slate-700"
          >
            <option value="">Select payment method</option>
            <option value="credit-card">Credit Card</option>
            <option value="crypto">Cryptocurrency</option>
          </select>
        </div>
      )}

      {/* Payment Summary */}
      {formData.paymentOption && formData.scooter && formData.startDate && formData.endDate && (
        <div className={`mb-6 p-4 rounded-lg border ${formData.paymentOption === "pickup" ? "bg-teal-50 border-teal-200" : "bg-green-50 border-green-200"}`}>
          <div className={`text-sm font-semibold mb-2 ${formData.paymentOption === "pickup" ? "text-teal-800" : "text-green-800"}`}>
            {formData.paymentOption === "pickup" ? "Booking Summary" : "Payment Summary"}
          </div>
          <div className="space-y-1 text-sm text-slate-700">
            {formData.paymentOption === "pickup" ? (
              <>
                <div className="flex justify-between">
                  <span>Amount to pay now:</span>
                  <span className="font-bold text-teal-700">₱0 (No payment required)</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Pay at pickup:</span>
                  <span>₱{calculateTotal()}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-teal-200 text-xs text-teal-600">
                  Pay in Cash or GCash when you pick up your scooter at our store
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>Amount to pay now:</span>
                  <span className="font-bold text-green-700">₱{getPaymentAmount()}</span>
                </div>
                {formData.paymentOption === "deposit" && (
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Remaining balance:</span>
                    <span>₱{Math.round(calculateTotal() - calculateDeposit())}</span>
                  </div>
                )}
                {formData.paymentMethod && (
                  <div className="flex justify-between mt-2 pt-2 border-t border-green-200">
                    <span>Payment via:</span>
                    <span className="font-semibold capitalize">{formData.paymentMethod.replace('-', ' ')}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {paymentError && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-500 rounded-lg text-red-800">
          <div className="font-semibold mb-2 flex items-center gap-2">
            ❌ Payment Error
          </div>
          <div className="text-sm">{paymentError}</div>
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessingPayment}
        className={`w-full font-bold py-4 px-6 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl ${
          isProcessingPayment
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white'
        }`}
      >
        {isProcessingPayment ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : formData.paymentOption === "pickup" ? (
          '💵 Pay Cash on Collection – No Payment Now'
        ) : (
          '🏝️ Submit Booking & Pay 🌴'
        )}
      </button>

      {/* Success Modal */}
      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-bold text-green-700 flex items-center gap-2">
                <span className="text-2xl">✅</span>
                Booking Confirmed!
              </h3>
              <button
                onClick={handleCloseSuccessModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🛵</span>
                </div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">
                  Thank you for your booking!
                </h4>
                <p className="text-slate-600">
                  Your reservation has been received and is being processed.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-xl">📧</span>
                  <div>
                    <div className="font-medium text-slate-800">Confirmation Email Sent</div>
                    <div className="text-sm text-slate-600">Check your inbox at <strong>{formData.email}</strong></div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-xl">💬</span>
                  <div>
                    <div className="font-medium text-slate-800">WhatsApp Notification</div>
                    <div className="text-sm text-slate-600">Sent to Palm Riders at <strong>+63 945 701 4440</strong></div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-xl">📱</span>
                  <div>
                    <div className="font-medium text-slate-800">We'll Contact You</div>
                    <div className="text-sm text-slate-600">Expect a WhatsApp message at <strong>{formData.phone}</strong></div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <div className="font-semibold text-slate-800 mb-2">Payment Details</div>
                <div className="text-sm text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span className="font-medium capitalize">{formData.paymentMethod.replace('-', ' ')}</span>
                  </div>
                  {formData.paymentOption === "deposit" ? (
                    <>
                      <div className="flex justify-between">
                        <span>Deposit Paid:</span>
                        <span className="font-medium text-green-600">₱{calculateDeposit()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Balance Due:</span>
                        <span className="font-medium">₱{calculateTotal() - calculateDeposit()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-medium text-green-600">₱{calculateTotal()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseSuccessModal}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </form>
    </>
  );
}
