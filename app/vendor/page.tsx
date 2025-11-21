// app/vendor/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/app/components/Pages/vendor/Dashboard";
import Sidebar from "../components/Pages/vendor/Sidebar";
import { FaLock } from "react-icons/fa";
export default function VendorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ✅ NEW: Verify vendor token from backend
  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          credentials: "include",
        });

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.user) {
          router.replace("/login");
          return;
        }

        // ✅ only vendor allowed
        if (data.user.accountType !== "vendor") {
          router.replace("/login");
          return;
        }
      } catch (err) {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [router]);


  // ✅ YOUR CODE (UNCHANGED)
  // Refresh user from server
  const refreshUser = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const vendorId = stored?._id || stored?.id;
      if (!vendorId) return;

      const res = await fetch(`/api/admin/vendors?id=${vendorId}`);
      const data = await res.json();

      if (data.success && data.vendor) {
        const updatedUser = {
          ...stored,
          _id: data.vendor._id || stored._id,
          isVendorApproved: data.vendor.isVendorApproved,
          isVendorLocked: data.vendor.isVendorLocked || false,
          vendorServices: data.vendor.vendorServices || [],
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        // Lock if not approved OR if explicitly locked
        setLocked(!updatedUser.isVendorApproved || updatedUser.isVendorLocked);
      }
    } catch (err) {
      console.error("Failed to refresh vendor status:", err);
    }
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");

    if (!stored || stored.accountType !== "vendor") {
      router.push("/login");
      return;
    }

    setUser(stored);
    // Lock if not approved OR if explicitly locked
    setLocked(!stored.isVendorApproved || stored.isVendorLocked);

   // Poll if not approved OR if locked (to detect unlock)
   if (!stored.isVendorApproved || stored.isVendorLocked) {
  const interval = setInterval(refreshUser, 1000); // every 5 seconds
  return () => clearInterval(interval);
}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // React to live updates
  useEffect(() => {
    if (user?.isVendorApproved && !user?.isVendorLocked) {
      setLocked(false);
    } else if (user?.isVendorLocked) {
      setLocked(true);
    }
  }, [user]);

  if (loading)
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );

  if (locked) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <FaLock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Your Vendor Dashboard Is Locked</h1>
          <p className="text-gray-600">
            Your account has been locked by the administrator. You temporarily cannot access vendor tools or view your services.
            We’ll automatically unlock this page as soon as the admin removes the lock.
          </p>
          <p className="text-sm text-gray-500">
            Need help? Please contact support or check back later.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 relative ">
      {/* Desktop sidebar */}
         <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen pt-15 overflow-y-auto overflow-x-hidden">
        <Sidebar />
      </div>
      {/* Content */}
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
        <main className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-hidden ">
          <Dashboard locked={false} />
        </main>
      </div>
      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-100 p-0 lg:hidden overflow-y-auto">
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
}