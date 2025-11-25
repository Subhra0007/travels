"use client";

import { useEffect, useState } from "react";
import BookingTable, { type BookingRecord } from "@/app/components/bookings/BookingTable";
import PageLoader from "@/app/components/common/PageLoader";
import { useVendorLayout } from "../VendorLayoutContext";

const VendorBookingsPage = () => {
  const { user } = useVendorLayout();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [initialFetch, setInitialFetch] = useState(true);
  const [actionBookingId, setActionBookingId] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      setError(null);
      const res = await fetch("/api/bookings", { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Unable to load bookings");
      }
      setBookings(data.bookings ?? []);
    } catch (err: any) {
      console.error("Vendor bookings fetch failed", err);
      setError(err?.message || "Failed to load bookings. Please try again.");
    } finally {
      setActionBookingId(null);
      setInitialFetch(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const handleStatusChange = async (bookingId: string, status: string) => {
    setActionBookingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to update booking status");
      }
      await loadBookings();
    } catch (err: any) {
      alert(err?.message || "Unable to update status. Please try again.");
      setActionBookingId(null);
    }
  };

  if (!user) return <PageLoader fullscreen={false} />;

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-600">
          Track every reservation received for your booking. Update status as you confirm, host, or cancel bookings.
        </p>
      </div>

      {initialFetch ? (
        <PageLoader fullscreen={false} className="py-16" />
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          <p className="font-semibold">We couldn&apos;t retrieve your bookings.</p>
          <p className="mt-2">{error}</p>
          <button
            type="button"
            onClick={() => loadBookings()}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-green-700"
          >
            Refresh page
          </button>
        </div>
      ) : (
        <div className="w-full">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <BookingTable
                  bookings={bookings}
                  variant="vendor"
                  loadingBookingId={actionBookingId}
                  onUpdateStatus={handleStatusChange}
                  emptyMessage="Bookings made for your properties will show here. Once a guest completes the checkout form, the reservation is logged instantly."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorBookingsPage;
