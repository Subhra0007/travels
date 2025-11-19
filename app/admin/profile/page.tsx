"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{ loginCount: number; lastLogin: string | null } | null>(null);
  const [admin, setAdmin] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        // Verify admin
        const verifyRes = await fetch("/api/auth/verify", { credentials: "include" });
        if (!verifyRes.ok) {
          router.push("/login");
          return;
        }
        const verifyData = await verifyRes.json().catch(() => null);
        const verifiedUser = verifyData?.user;
        if (!verifiedUser || verifiedUser.accountType !== "admin") {
          router.push("/login");
          return;
        }
        setAdmin({ email: verifiedUser.email });

        // Fetch metrics
        const res = await fetch("/api/admin/meta", { credentials: "include" });
        const data = await res.json();
        if (data.success) {
          setMeta({
            loginCount: data.meta.loginCount || 0,
            lastLogin: data.meta.lastLogin || null,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-20 text-gray-900">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-1">Admin Profile</h1>
        <p className="text-gray-600 mb-6">Account overview and login activity</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border p-5">
            <div className="text-sm text-gray-500">Email</div>
            <div className="text-lg font-medium">{admin?.email}</div>
          </div>
          <div className="rounded-xl border p-5">
            <div className="text-sm text-gray-500">Login Count</div>
            <div className="text-2xl font-bold">{meta?.loginCount ?? 0}</div>
          </div>
          <div className="rounded-xl border p-5 md:col-span-2">
            <div className="text-sm text-gray-500">Last Login</div>
            <div className="text-lg font-medium">
              {meta?.lastLogin
                ? new Date(meta.lastLogin).toLocaleString()
                : "No data yet"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


