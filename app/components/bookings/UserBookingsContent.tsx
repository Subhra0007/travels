"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaBars } from "react-icons/fa";
import BookingTable, { type BookingRecord } from "./BookingTable";

const UserBookingsContent: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [tableLoadingId, setTableLoadingId] = useState<string | null>(null);
  const [tableRefreshing, setTableRefreshing] = useState(false);

  const verifyUser = async () => {
    try {
      const res = await fetch("/api/auth/verify", { credentials: "include" });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      const data = await res.json();
      if (data.user.accountType === "vendor") {
        router.replace("/vendor");
        return;
      }
      if (data.user.accountType === "admin") {
        router.replace("/admin");
        return;
      }
      setUser(data.user);
    } catch (error) {
      console.error("Failed to verify user", error);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      setTableRefreshing(true);
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
    }
  };

  useEffect(() => {
    verifyUser();
  }, []);

  useEffect(() => {
    if (!loading && user) {
      loadBookings();
    }
  }, [loading, user]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
      }
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      window.location.href = "/login";
    }
  };

  const Avatar = ({ size = 64 }: { size?: number }) => {
    if (!user) return null;
    if (user.avatar) {
      return (
        <Image
          src={user.avatar}
          alt="Profile"
          width={size}
          height={size}
          className="rounded-full border-4 border-green-200"
          style={{ width: size, height: size }}
        />
      );
    }
    const first = user.fullName?.trim().charAt(0).toUpperCase() ?? "U";
    return (
      <div
        className="flex items-center justify-center rounded-full border-4 border-green-200 text-white font-bold"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.45,
          background: "linear-gradient(to bottom right, #22c55e, #0ea5e9)",
        }}
      >
        {first}
      </div>
    );
  };

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

  const sidebarItems = useMemo(
    () => [
      { label: "My Profile", href: "/profile", key: "profile" },
      { label: "Booking History", href: "/bookings", key: "bookings", active: true },
      { label: "Wishlist", href: "/wishlist", key: "wishlist" },
      { label: "Inbox", href: "/profile/inbox", key: "inbox" },
      { label: "Contact Support", href: "/profile/support", key: "support" },
    ],
    []
  );

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-sky-50 text-black">
      <div className="hidden w-72 shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
        <div className="flex flex-col items-center gap-2 px-6 pt-16 pb-8">
          <Avatar size={80} />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">{user.fullName}</h2>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2 px-4 pb-6">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => router.push(item.href)}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                item.active
                  ? "bg-linear-to-r from-green-500 to-green-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-green-50 hover:text-green-600"
              }`}
            >
              {item.label}
              {item.active && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wide">Active</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 bg-sky-50 px-4 pt-16 pb-6 shadow-sm lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm"
              >
                <FaBars />
                Menu
              </button>
              <div>
                <p className="text-xs text-gray-500">Welcome back</p>
                <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
              </div>
            </div>
            <Avatar size={48} />
          </div>
        </header>

        <main className="flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-16">
          <div className="mb-6 flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-gray-900">My bookings</h1>
            <p className="text-sm text-gray-600">
              Keep track of every stay you reserve across the Travels platform. You can view room details, totals, and cancel if plans change.
            </p>
            {tableRefreshing && (
              <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Updating your bookings…
              </span>
            )}
          </div>

          <BookingTable
            bookings={bookings}
            variant="user"
            onCancel={handleCancelBooking}
            loadingBookingId={tableLoadingId}
            emptyMessage="Once you confirm a stay, it will appear here with the reference number and stay details."
          />
        </main>
      </div>

      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white shadow-2xl lg:hidden">
            <div className="flex flex-col items-center gap-2 px-6 pt-10 pb-6">
              <Avatar size={64} />
              <h2 className="text-base font-semibold text-gray-900">{user.fullName}</h2>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <nav className="space-y-2 px-4 pb-10">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    router.push(item.href);
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                    item.active
                      ? "bg-linear-to-r from-green-500 to-green-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                  }`}
                >
                  {item.label}
                  {item.active && (
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                      Active
                    </span>
                  )}
                </button>
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileSidebarOpen(false);
                }}
                className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};

export default UserBookingsContent;

