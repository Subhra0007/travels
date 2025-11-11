"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Pages/admin/Sidebar";
import Dashboard from "../components/Pages/admin/Dashboard";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify", { credentials: "include" });
        if (res.status !== 200) return router.replace("/login");

        const data = await res.json();
        if (data.user.accountType !== "admin") return router.replace("/login");

        setAuthorized(true);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [router]);

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!authorized) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto mt-15">
        <Dashboard />
      </main>
    </div>
  );
}
