"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Pages/vendor/Sidebar";
import BookingTable, { type BookingRecord } from "@/app/components/bookings/BookingTable";

const VendorCancellationsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const verifyVendor = async () => {
    try {
      const res = await fetch("/api/auth/verify", { credentials: "include" });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const data = await res.json().catch(() => null);
      const verifiedUser = data?.user;
      if (!res.ok || !verifiedUser) {
        router.replace("/login");
        return;
      }
      if (verifiedUser.accountType !== "vendor") {
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

  const loadCancelledBookings = async () => {
    try {
      setError(null);
      const res = await fetch("/api/bookings?status=cancelled", { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Unable to load cancellations");
      }
      setBookings(data.bookings ?? []);
    } catch (err: any) {
      console.error("Vendor cancellations fetch failed", err);
      setError(err?.message || "Failed to load cancellations.");
    }
  };

  useEffect(() => {
    verifyVendor();
  }, []);

  useEffect(() => {
    if (authorized) {
      loadCancelledBookings();
    }
  }, [authorized]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
   <div className="flex h-screen bg-gray-50 relative ">
            {/* Desktop sidebar */}
               {/* <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen pt-15 overflow-y-auto overflow-x-hidden">
              <Sidebar />
            </div> */}
   
          <div className="flex-1 flex flex-col mt-15 overflow-hidden">
           {/* Topbar with mobile trigger */}
           <div className="sticky top-0 z-40 bg-sky-50">
             <div className="flex items-center gap-3 p-3 border-b">
               <button
                 className="lg:hidden px-3 py-2 rounded border text-gray-700"
                 onClick={() => setMobileSidebarOpen(true)}
                 aria-label="Open menu"
               >
                 ☰
               </button>
             </div>
           </div>

        <main className="flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-10  w-full overflow-x-hidden">
          <div className="mb-6 flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-gray-900">Cancelled bookings</h1>
            <p className="text-sm text-gray-600">
              See every stay a guest cancelled so you can follow up, restock availability, and coordinate with the admin team.
            </p>
          </div>

          {error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              <p className="font-semibold">We couldn&apos;t retrieve cancellations.</p>
              <p className="mt-2">{error}</p>
              <button
                type="button"
                onClick={() => loadCancelledBookings()}
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
                      emptyMessage="Cancelled bookings will appear here instantly, so you can keep an eye on your calendar."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-100 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-100 w-72 overflow-y-auto bg-white shadow-2xl lg:hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">Menu</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="px-3 py-1.5 rounded-md border text-gray-700"
              >
                Close
              </button>
            </div>
            <Sidebar />
          </div>
        </>
      )}
    </div>
  );
};

export default VendorCancellationsPage;

