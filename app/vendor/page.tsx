// app/vendor/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/app/components/Pages/vendor/Dashboard";

export default function VendorPage() {
  const router = useRouter();
  const [locked, setLocked] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Refresh user from server
  const refreshUser = async () => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    if (!stored?._id) return;

    try {
      const res = await fetch(`/api/admin/vendors?id=${stored._id}`);
      const data = await res.json();

      if (data.success && data.vendor) {
        const updatedUser = {
          ...stored,
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
      router.push("/profile");
      return;
    }

    setUser(stored);
    setLocked(!stored.isVendorApproved);

    // Poll every 7 seconds while locked
    if (!stored.isVendorApproved) {
      const interval = setInterval(refreshUser, 7000);
      return () => clearInterval(interval);
    }
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