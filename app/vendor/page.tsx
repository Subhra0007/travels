// app/vendor/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/app/components/Pages/vendor/Dashboard";

export default function VendorPage() {
  const router = useRouter();
  const [locked, setLocked] = useState(true);
  const [user, setUser] = useState<any>(null);

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

        const data = await res.json();

        // ✅ only vendor allowed
        if (data.user.accountType !== "vendor") {
          router.replace("/login");
          return;
        }
      } catch (err) {
        router.replace("/login");
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
          vendorServices: data.vendor.vendorServices || [],
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setLocked(!updatedUser.isVendorApproved);
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
    setLocked(!stored.isVendorApproved);

   if (!stored.isVendorApproved) {
  const interval = setInterval(refreshUser, 1000); // every 10 seconds
  return () => clearInterval(interval);
}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // React to live updates
  useEffect(() => {
    if (user?.isVendorApproved) {
      setLocked(false);
    }
  }, [user]);

  return (
    <main className="min-h-screen">
      <Dashboard locked={locked} />
    </main>
  );
}
