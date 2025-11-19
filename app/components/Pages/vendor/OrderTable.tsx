"use client";

import { useEffect, useState } from "react";

type Booking = {
  _id: string;
  serviceName: string;
  status: string;
  price: number;
};

export default function OrderTable({ refreshKey = 0 }: { refreshKey?: number }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (bookings.length === 0) setLoading(true);
        const res = await fetch(`/api/vendor/stats?t=${Date.now()}`, { 
          credentials: "include",
          cache: "no-store"
        });
        const data = await res.json();
        if (data.success && data.recentBookings) {
          setBookings(data.recentBookings);
        }
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [refreshKey, bookings.length]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-600";
      case "confirmed":
        return "bg-blue-100 text-blue-600";
      case "pending":
        return "bg-yellow-100 text-yellow-600";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow text-gray-900">
      <h3 className="font-semibold mb-4">Recent Bookings</h3>
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-gray-500">No recent bookings</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="py-2 text-left">Service Name</th>
              <th>Status</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} className="border-b last:border-none">
                <td className="py-2">{booking.serviceName}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td>{formatPrice(booking.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
