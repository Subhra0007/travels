"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/app/components/Pages/vendor/Dashboard";

export default function VendorPage() {
  const router = useRouter();
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user.accountType !== "vendor") {
      router.push("/profile");
      return;
    }

    // Vendor dashboard remains locked until vendor setup is completed
    setLocked(!user.isVendorSetupComplete);
  }, []);

  return (
    <main className="min-h-screen z-10">
      <Dashboard locked={locked} />
    </main>
  );
}
