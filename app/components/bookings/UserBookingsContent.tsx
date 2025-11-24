//app/components/bookings/UserBookingsContent.tsx
"use client";

import { useEffect, useState } from "react";

import BookingTable, { type BookingRecord } from "./BookingTable";
import PageLoader from "../common/PageLoader";
import { useProfileLayout } from "@/app/profile/ProfileLayoutContext";

const UserBookingsContent: React.FC = () => {
  const { user } = useProfileLayout();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [tableLoadingId, setTableLoadingId] = useState<string | null>(null);
  const [tableRefreshing, setTableRefreshing] = useState(false);
  const [initialFetch, setInitialFetch] = useState(true);

  const loadBookings = async (isInitial = false) => {
    try {
      if (!isInitial) {
        setTableRefreshing(true);
      }
      const res = await fetch("/api/bookings", { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings(data.bookings || []);
      } else {
        console.warn("Failed to load bookings", data?.message);
      }
    } catch (error) {
      console.error("Unable to load bookings", error);
    } finally {
      setTableRefreshing(false);
      setTableLoadingId(null);
      if (isInitial) {
        setInitialFetch(false);
      }
    }
  };

  useEffect(() => {
    loadBookings(true);
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    const reason = window.prompt("Let the host know why you are cancelling (optional).") ?? "";
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      setTableLoadingId(bookingId);
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "cancelled", reason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to cancel booking");
      }
      await loadBookings();
    } catch (error: any) {
      alert(error?.message || "Unable to cancel booking. Please try again.");
      setTableLoadingId(null);
    }
  };

  if (!user) {
    return <PageLoader fullscreen={false} />;
  }

  return (
    <div className="space-y-6 pt-15">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-800">Booking History</h1>
        <p className="text-sm text-gray-600">
          Keep track of every stay you reserve across the platform. You can view details, totals, and cancel if plans change.
        </p>
        {tableRefreshing && (
          <span className="inline-flex items-center gap-2 text-xs text-gray-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Updating your bookings…
          </span>
        )}
      </header>

      {initialFetch ? (
        <PageLoader fullscreen={false} className="py-16" />
      ) : (
        <BookingTable
          bookings={bookings}
          variant="user"
          onCancel={handleCancelBooking}
          loadingBookingId={tableLoadingId}
          emptyMessage="Once you confirm a stay, it will appear here with the reference number and stay details."
        />
      )}
    </div>
  );
};

export default UserBookingsContent;