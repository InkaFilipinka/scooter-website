"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Bike,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Link as LinkIcon,
  Plus,
  Copy,
  Trash2,
  ExternalLink,
  Loader2,
  Printer,
} from "lucide-react";
import { addOns } from "@/data/add-ons";

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  scooter: string;
  quantity?: number;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  delivery: string;
  distance: string;
  paymentOption: string;
  paymentMethod: string;
  total: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  timestamp: string;
  addOns?: string[];
}

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
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"bookings" | "payments">("bookings");
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [poolAvailable, setPoolAvailable] = useState<number>(4);
  const [isSavingPool, setIsSavingPool] = useState(false);
  const router = useRouter();

  // Payment link form state
  const [linkAmount, setLinkAmount] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [linkCustomerName, setLinkCustomerName] = useState("");
  const [linkCustomerEmail, setLinkCustomerEmail] = useState("");
  const [linkExpiry, setLinkExpiry] = useState("24"); // hours

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem("adminAuth");
    if (!isAuth) {
      router.push("/admin");
      return;
    }

    // Load bookings
    loadBookings();
    // Load payment links
    loadPaymentLinks();
    // Load pool
    fetch("/api/pool")
      .then((r) => r.json())
      .then((data) => typeof data.available === "number" && setPoolAvailable(data.available))
      .catch(() => {});
  }, [router]);

  const loadBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      const data = await response.json();
      if (response.ok && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error("Failed to load bookings:", error);
    }
  };

  const loadPaymentLinks = async () => {
    setIsLoadingLinks(true);
    try {
      const response = await fetch("/api/payment-links");
      const data = await response.json();
      if (response.ok && data.paymentLinks) {
        setPaymentLinks(data.paymentLinks);
      }
    } catch (error) {
      console.error("Failed to load payment links:", error);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    router.push("/admin");
  };

  const updateBookingStatus = async (id: string, newStatus: Booking["status"]) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (response.ok) {
        const updated = bookings.map(booking =>
          booking.id === id ? { ...booking, status: newStatus } : booking
        );
        setBookings(updated);
      }
    } catch (error) {
      console.error("Failed to update booking status:", error);
    }
  };

  const updatePool = async (value: number) => {
    setPoolAvailable(value);
    setIsSavingPool(true);
    try {
      const res = await fetch("/api/pool", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: value }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch (err) {
      console.error("Failed to update pool:", err);
      fetch("/api/pool").then((r) => r.json()).then((d) => setPoolAvailable(d.available ?? 4));
    } finally {
      setIsSavingPool(false);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      const response = await fetch(`/api/bookings?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setBookings(bookings.filter(booking => booking.id !== id));
      } else {
        console.error("Failed to delete booking");
      }
    } catch (error) {
      console.error("Failed to delete booking:", error);
    }
  };

  const createPaymentLink = async () => {
    if (!linkAmount || Number(linkAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsCreatingLink(true);
    try {
      const response = await fetch("/api/payment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(linkAmount),
          description: linkDescription,
          customerName: linkCustomerName,
          customerEmail: linkCustomerEmail,
          expiresInHours: linkExpiry ? Number(linkExpiry) : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Copy link to clipboard
        await navigator.clipboard.writeText(data.paymentUrl);
        setCopiedId(data.paymentLink.id);
        setTimeout(() => setCopiedId(null), 3000);

        // Reset form
        setLinkAmount("");
        setLinkDescription("");
        setLinkCustomerName("");
        setLinkCustomerEmail("");

        // Reload payment links
        await loadPaymentLinks();

        alert(`Payment link created and copied to clipboard!\n\n${data.paymentUrl}`);
      } else {
        alert(data.error || "Failed to create payment link");
      }
    } catch (error) {
      console.error("Failed to create payment link:", error);
      alert("Failed to create payment link");
    } finally {
      setIsCreatingLink(false);
    }
  };

  const copyPaymentLink = async (id: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://siargaoscooterrentals.com";
    const url = `${baseUrl}/pay/${id}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const deletePaymentLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment link?")) return;

    try {
      const response = await fetch(`/api/payment-links?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadPaymentLinks();
      } else {
        alert("Failed to delete payment link");
      }
    } catch (error) {
      console.error("Failed to delete payment link:", error);
    }
  };

  const filteredBookings = filter === "all"
    ? bookings
    : bookings.filter(b => b.status === filter);

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    completed: bookings.filter(b => b.status === "completed").length,
  };

  const paymentStats = {
    total: paymentLinks.length,
    pending: paymentLinks.filter(p => p.status === "pending").length,
    paid: paymentLinks.filter(p => p.status === "paid").length,
    totalRevenue: paymentLinks.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "paid": return "bg-green-100 text-green-800";
      case "expired": return "bg-slate-100 text-slate-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      case "paid": return <CheckCircle className="w-4 h-4" />;
      case "expired": return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Palm Riders Admin</h1>
              <p className="text-slate-600">Booking Management Dashboard</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "bookings"
                ? "bg-teal-500 text-white shadow-lg"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Calendar className="w-5 h-5" />
            Bookings
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "payments"
                ? "bg-teal-500 text-white shadow-lg"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            <LinkIcon className="w-5 h-5" />
            Payment Links
          </button>
        </div>

        {activeTab === "bookings" ? (
          <>
            {/* Pool control */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Bike className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-bold text-slate-900">Available Scooters</h2>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={4}
                  step={1}
                  value={poolAvailable}
                  onChange={(e) => updatePool(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <span className="text-2xl font-bold text-teal-600 min-w-[3rem]">{poolAvailable}</span>
                <span className="text-slate-600 text-sm">scooters available</span>
                {isSavingPool && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Adjust when scooters are rented or returned. New bookings auto-decrement this value.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-slate-600 text-sm mb-1">Total Bookings</div>
                <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-slate-600 text-sm mb-1">Pending</div>
                <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-slate-600 text-sm mb-1">Confirmed</div>
                <div className="text-3xl font-bold text-blue-600">{stats.confirmed}</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-slate-600 text-sm mb-1">Completed</div>
                <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-slate-700">
                  <Filter className="w-5 h-5" />
                  <span className="font-semibold">Filter:</span>
                </div>
                {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === status
                        ? "bg-orange-500 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <div className="text-slate-400 text-lg">No bookings found</div>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900">{booking.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500">
                          Booked on {new Date(booking.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-500">₱{booking.total}</div>
                        <div className="text-sm text-slate-600">{booking.paymentOption === "deposit" ? "Deposit" : "Full Payment"}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{booking.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{booking.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Bike className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {booking.scooter}
                          {(booking.quantity ?? 1) > 1 && ` × ${booking.quantity}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{booking.startDate} → {booking.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{booking.pickupLocation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm capitalize">{booking.paymentMethod?.replace?.(/-/g, ' ') ?? '—'}</span>
                      </div>
                      {booking.addOns && booking.addOns.length > 0 && (
                        <div className="flex items-start gap-2 text-slate-600 md:col-span-2 lg:col-span-3">
                          <span className="text-sm font-medium shrink-0">Add-ons:</span>
                          <span className="text-sm">
                            {booking.addOns
                              .map((id) => addOns.find((a) => a.id === id)?.name ?? id)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {booking.delivery === "yes" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="text-sm text-blue-800">
                          <strong>Delivery:</strong> {booking.distance} km • Fee: ₱{Math.max(100, Math.round(parseFloat(booking.distance || '0') * 12.5 * 2))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {booking.status === "pending" && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, "confirmed")}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Confirm Booking
                        </button>
                      )}
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, "completed")}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Mark as Completed
                        </button>
                      )}
                      {booking.status !== "cancelled" && booking.status !== "completed" && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, "cancelled")}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                      <a
                        href={`/api/print-booking?id=${encodeURIComponent(booking.id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                        Download / Print
                      </a>
                      <button
                        onClick={() => deleteBooking(booking.id)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* Payment Links Section */}
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-slate-600 text-sm mb-1">Total Links</div>
                <div className="text-3xl font-bold text-slate-900">{paymentStats.total}</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-slate-600 text-sm mb-1">Pending</div>
                <div className="text-3xl font-bold text-yellow-600">{paymentStats.pending}</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-slate-600 text-sm mb-1">Paid</div>
                <div className="text-3xl font-bold text-green-600">{paymentStats.paid}</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-slate-600 text-sm mb-1">Revenue</div>
                <div className="text-3xl font-bold text-teal-600">₱{paymentStats.totalRevenue.toLocaleString()}</div>
              </div>
            </div>

            {/* Create Payment Link Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-500" />
                Create Payment Link
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Amount (₱) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={linkAmount}
                    onChange={(e) => setLinkAmount(e.target.value)}
                    placeholder="1000"
                    min="1"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={linkDescription}
                    onChange={(e) => setLinkDescription(e.target.value)}
                    placeholder="e.g., Scooter rental deposit"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={linkCustomerName}
                    onChange={(e) => setLinkCustomerName(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Expires In
                  </label>
                  <select
                    value={linkExpiry}
                    onChange={(e) => setLinkExpiry(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800"
                  >
                    <option value="">Never</option>
                    <option value="1">1 hour</option>
                    <option value="6">6 hours</option>
                    <option value="24">24 hours</option>
                    <option value="48">48 hours</option>
                    <option value="168">7 days</option>
                  </select>
                </div>
              </div>

              <button
                onClick={createPaymentLink}
                disabled={isCreatingLink || !linkAmount}
                className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingLink ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-5 h-5" />
                    Create & Copy Link
                  </>
                )}
              </button>
            </div>

            {/* Payment Links List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Payment Links</h2>
                <button
                  onClick={loadPaymentLinks}
                  disabled={isLoadingLinks}
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  {isLoadingLinks ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Refresh
                </button>
              </div>

              {isLoadingLinks ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-2" />
                  <p className="text-slate-500">Loading payment links...</p>
                </div>
              ) : paymentLinks.length === 0 ? (
                <div className="p-12 text-center">
                  <LinkIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No payment links yet</p>
                  <p className="text-sm text-slate-400">Create one using the form above</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {paymentLinks.map((link) => (
                    <div key={link.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-slate-900">₱{link.amount.toLocaleString()}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(link.status)}`}>
                              {getStatusIcon(link.status)}
                              {link.status.charAt(0).toUpperCase() + link.status.slice(1)}
                            </span>
                          </div>
                          <div className="text-sm text-slate-600 truncate">
                            {link.description || "No description"}
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                            <span>ID: {link.id}</span>
                            <span>Created: {new Date(link.createdAt).toLocaleString()}</span>
                            {link.paidAt && (
                              <span className="text-green-600">Paid: {new Date(link.paidAt).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyPaymentLink(link.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              copiedId === link.id
                                ? "bg-green-100 text-green-600"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                            title="Copy link"
                          >
                            {copiedId === link.id ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </button>
                          <a
                            href={`/pay/${link.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Open link"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                          <button
                            onClick={() => deletePaymentLink(link.id)}
                            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                            title="Delete link"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
