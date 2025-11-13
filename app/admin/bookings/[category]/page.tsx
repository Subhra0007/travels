"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/app/components/Pages/admin/Sidebar";
import BookingTable, { type BookingRecord } from "@/app/components/bookings/BookingTable";

const CATEGORY_LABELS: Record<string, string> = {
  stays: "Stay bookings",
  tours: "Tour bookings",
  adventures: "Adventure bookings",
  "vehicle-rental": "Vehicle rental bookings",
  cancellations: "Cancelled bookings",
};

const AdminBookingsCategoryPage = () => {
  const router = useRouter();
  const params = useParams();
  const categoryParam = Array.isArray(params?.category) ? params?.category[0] : (params?.category as string) || "stays";
  const category = CATEGORY_LABELS[categoryParam] ? categoryParam : "stays";

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  const verifyAdmin = async () => {
    try {
      const res = await fetch("/api/auth/verify", { credentials: "include" });
      if (res.status !== 200) {
        router.replace("/login");
        return;
      }

      const data = await res.json();
      if (data.user?.accountType !== "admin") {
        router.replace("/login");
        return;
      }
      setAuthorized(true);
    } catch (error) {
      console.error("Admin auth failed", error);
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
    } catch (err: any) {
      console.error("Admin bookings fetch failed", err);
      setError(err?.message || "Failed to load bookings. Please try again.");
    }
  };

  useEffect(() => {
    verifyAdmin();
  }, []);

  useEffect(() => {
    if (authorized) {
      loadBookings();
    }
  }, [authorized]);

  useEffect(() => {
    if (!CATEGORY_LABELS[categoryParam]) {
      router.replace("/admin/bookings/stays");
    }
  }, [categoryParam, router]);

  const filteredBookings = useMemo(() => {
    if (category === "stays") return bookings;
    if (category === "cancellations") return bookings.filter((booking) => booking.status === "cancelled");
    return [];
  }, [bookings, category]);

  const emptyMessage = useMemo(() => {
    switch (category) {
      case "stays":
        return "Confirmed stay reservations will appear here as soon as guests complete the booking form.";
      case "cancellations":
        return "When a booking is cancelled it will appear in this view for quick follow-up.";
      default:
        return "Support for this booking category is coming soon.";
    }
  }, [category]);

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
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 bg-slate-50 px-4 pt-6 pb-4 shadow-sm lg:hidden">
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm"
            onClick={() => setMobileSidebarOpen(true)}
          >
            ☰ Menu
          </button>
        </header>

        <main className="flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-16">
          <div className="mb-6 flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-gray-900">{CATEGORY_LABELS[category]}</h1>
            <p className="text-sm text-gray-600">
              Monitor reservations submitted by travellers. Use this dashboard to confirm stays, audit platform fees, and follow up with guests and vendors.
            </p>
            {category !== "stays" && category !== "cancellations" && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-700">
                We&apos;re still wiring up bookings for this category. You can continue to manage stay bookings while the additional services sync is completed.
              </div>
            )}
          </div>

          {error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              <p className="font-semibold">We couldn&apos;t retrieve bookings.</p>
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
            <BookingTable bookings={filteredBookings} variant="admin" emptyMessage={emptyMessage} />
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

export default AdminBookingsCategoryPage;

