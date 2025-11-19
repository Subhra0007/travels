"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Pages/vendor/Sidebar";
import BookingTable, { type BookingRecord } from "@/app/components/bookings/BookingTable";

const VendorBookingsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [actionBookingId, setActionBookingId] = useState<string | null>(null);

  const verifyVendor = async () => {
    try {
      const res = await fetch("/api/auth/verify", { credentials: "include" });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const data = await res.json();
      if (data.user?.accountType !== "vendor") {
        router.replace("/profile");
        return;
      }

      setAuthorized(true);
    } catch (err) {
      console.error("Vendor auth failed", err);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      setError(null);
      const res = await fetch("/api/bookings", { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Unable to load bookings");
      }
      setBookings(data.bookings ?? []);
    } catch (err) {
      console.error("Vendor bookings fetch failed", err);
      const message = err instanceof Error ? err.message : "Failed to load bookings. Please try again.";
      setError(message);
    } finally {
      setActionBookingId(null);
    }
  };

  useEffect(() => {
    verifyVendor();
  }, []);

  useEffect(() => {
    if (authorized) {
      loadBookings();
    }
  }, [authorized]);

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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update status. Please try again.";
      alert(message);
      setActionBookingId(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 bg-slate-50 px-4 pt-10 pb-4 shadow-sm lg:hidden">
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm"
            onClick={() => setMobileSidebarOpen(true)}
          >
            ☰ Menu
          </button>
        </header>

        <main className="flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-16">
          <div className="mb-6 flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-gray-900">Stay bookings</h1>
            <p className="text-sm text-gray-600">
              Track every reservation received for your stays. Update status as you confirm, host, or cancel bookings.
            </p>
          </div>

          {error ? (
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
            <div className="overflow-x-auto">
              <BookingTable
                bookings={bookings}
                variant="vendor"
                loadingBookingId={actionBookingId}
                onUpdateStatus={handleStatusChange}
                emptyMessage="Bookings made for your properties will show here. Once a guest completes the checkout form, the reservation is logged instantly."
              />
            </div>
          )}
        </main>
      </div>

      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white shadow-2xl lg:hidden">
            <Sidebar />
          </div>
        </>
      )}
    </div>
  );
};

export default VendorBookingsPage;
