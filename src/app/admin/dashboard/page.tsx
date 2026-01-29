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
  Filter
} from "lucide-react";

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  scooter: string;
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
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem("adminAuth");
    if (!isAuth) {
      router.push("/admin");
      return;
    }

    // Load bookings
    loadBookings();
  }, [router]);

  const loadBookings = () => {
    const stored = localStorage.getItem("bookings");
    if (stored) {
      setBookings(JSON.parse(stored));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    router.push("/admin");
  };

  const updateBookingStatus = (id: string, newStatus: Booking["status"]) => {
    const updated = bookings.map(booking =>
      booking.id === id ? { ...booking, status: newStatus } : booking
    );
    setBookings(updated);
    localStorage.setItem("bookings", JSON.stringify(updated));
  };

  const deleteBooking = (id: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      const updated = bookings.filter(booking => booking.id !== id);
      setBookings(updated);
      localStorage.setItem("bookings", JSON.stringify(updated));
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
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
                    <span className="text-sm font-semibold">{booking.scooter}</span>
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
                    <span className="text-sm capitalize">{booking.paymentMethod.replace('-', ' ')}</span>
                  </div>
                </div>

                {booking.delivery === "yes" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="text-sm text-blue-800">
                      <strong>Delivery:</strong> {booking.distance} km • Fee: ₱{parseFloat(booking.distance) * 10 * 2}
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
      </div>
    </div>
  );
}
