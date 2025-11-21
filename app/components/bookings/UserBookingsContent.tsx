//app/components/bookings/UserBookingsContent.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaBars } from "react-icons/fa";
import ProfileSidebar from "../Pages/profile/ProfileSidebar";
import { MdLogout } from "react-icons/md";
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
      const data = await res.json().catch(() => null);
      const verifiedUser = data?.user;
      if (!res.ok || !verifiedUser) {
        router.replace("/login");
        return;
      }
      if (verifiedUser.accountType === "vendor") {
        router.replace("/vendor");
        return;
      }
      if (verifiedUser.accountType === "admin") {
        router.replace("/admin");
        return;
      }
      setUser(verifiedUser);
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
      window.location.href = "/";
    }
  };

  const deleteAccount = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/profile", { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (data.success) {
        alert("Account deleted");
        router.push("/");
      }
    } catch {
      alert("Failed to delete account");
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
          background: "linear-gradient(to bottom right, #a855f7, #ec4899)",
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


  if (loading) {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row  bg-sky-50 text-black  min-h-screen">
        <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
         <div className="w-64 h-full bg-white shadow-lg  flex flex-col overflow-y-auto overflow-x-hidden">
      <ProfileSidebar
        user={user}
        active="bookings"
        onDeleteAccount={deleteAccount}
        onLogout={handleLogout}
      />
      </div>
</div>
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-10 pt-20 ">
        <div className="md:hidden mb-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow border text-gray-800"
          >
            <FaBars />
            <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <main className="flex-1 lg:pt-25 pt-5">
          <div className="mb-6 flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-gray-800">My bookings</h1>
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

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-90 bg-black/40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-100 p-6 md:hidden overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">Menu</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="px-3 py-1.5 rounded-md border text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="mb-8 flex flex-col items-center space-y-2">
              <Avatar size={56} />
              <h2 className="text-base font-bold text-center text-gray-800 truncate">
                {user.fullName}
              </h2>
              <p className="text-xs text-gray-500 text-center truncate">{user.email}</p>
            </div>
            <nav className="space-y-2">
              <button
                onClick={() => {
                  router.push("/profile");
                  setMobileSidebarOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                My Profile
              </button>
              <button
                onClick={() => {
                  router.push("/bookings");
                  setMobileSidebarOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 bg-linear-to-r from-green-500 to-green-600 text-white shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Booking History
              </button>
              <button
                onClick={() => {
                  router.push("/wishlist");
                  setMobileSidebarOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                Wishlist
              </button>
              <button
                onClick={() => {
                  router.push("/profile/inbox");
                  setMobileSidebarOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.94 6.412A2 2 0 002 8.108V16a2 2 0 002 2h12a2 2 0 002-2V8.108a2 2 0 00-.94-1.696l-6-3.75a2 2 0 00-2.12 0l-6 3.75zm2.615 2.423a1 1 0 10-1.11 1.664l5 3.333a1 1 0 001.11 0l5-3.333a1 1 0 00-1.11-1.664L10 11.798 5.555 8.835z" clipRule="evenodd" />
                </svg>
                Inbox
              </button>
              <button
                onClick={() => {
                  router.push("/profile/support");
                  setMobileSidebarOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Contact Support
              </button>
              <div className="my-4 border-t border-gray-100" />
              <button
                onClick={() => {
                  deleteAccount();
                  setMobileSidebarOpen(false);
                }}
                className="w-full bg-red-100 hover:bg-red-200 text-red-700 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 011-1h6a1 1 0 110 2H8a1 1 0 01-1-1zm1 4a1 1 0 100 2h6a1 1 0 100-2H8z"
                    clipRule="evenodd"
                  />
                </svg>
                Delete Account
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileSidebarOpen(false);
                }}
                className="w-full bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 flex items-center gap-3"
              >
                 <MdLogout className="w-5 h-5" />
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

