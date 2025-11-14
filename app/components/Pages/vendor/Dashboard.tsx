// app/components/Pages/vendor/Dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import StatCard from "./StatCard";
import SalesChart from "./SalesChart";
import OrderTable from "./OrderTable";
import SalesDonutChart from "./SalesDonutChart";
import { CreditCard, Wallet, Clock, CheckCircle } from "lucide-react";
import { FaBars } from "react-icons/fa";

export default function Dashboard({ locked }: { locked: boolean }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    todayBookings: 0,
    totalBookings: 0,
    todayEarnings: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Add cache-busting parameter to ensure fresh data
        const res = await fetch(`/api/vendor/stats?t=${Date.now()}`, { 
          credentials: "include",
          cache: "no-store"
        });
        const data = await res.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (!locked) {
      fetchStats();
    }
  }, [locked, refreshKey]);

  // Refresh when page becomes visible (user comes back to tab)
  useEffect(() => {
    if (locked) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setRefreshKey((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [locked]);

  // Refresh every 5 seconds when page is visible
  useEffect(() => {
    if (locked) return;

    const interval = setInterval(async () => {
      if (document.visibilityState === "visible") {
        try {
          // Add cache-busting parameter
          const res = await fetch(`/api/vendor/stats?t=${Date.now()}`, { 
            credentials: "include",
            cache: "no-store"
          });
          const data = await res.json();
          if (data.success && data.stats) {
            setStats(data.stats);
            // Also trigger child component refresh
            setRefreshKey((prev) => prev + 1);
          }
        } catch (error) {
          console.error("Failed to refresh stats", error);
        }
      }
    }, 5000); // 5 seconds for faster updates

    return () => clearInterval(interval);
  }, [locked]);

  const formatNumber = (n: number) => n.toLocaleString("en-IN");
  const formatINR = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="min-h-screen bg-gray-100 flex relative ">
      {locked && (
        <div className="absolute inset-0 z-10 backdrop-blur-[2px] pointer-events-none" />
      )}

      {locked && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="bg-white/90 shadow-xl p-6 rounded-xl border text-center max-w-sm">
            <h2 className="text-2xl font-bold text-gray-800">Vendor Dashboard Locked</h2>
            <p className="mt-2 text-gray-600">
              Your account has been locked by the administrator. Please contact support for assistance.
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 my-20 overflow-y-auto">
        <div className="px-4 sm:px-6">
          {/* Mobile/sidebar toggle and refresh button */}
          <div className="lg:hidden mb-4 flex items-center gap-2">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow border text-gray-800"
            >
              <FaBars />
              <span className="text-sm font-medium">Menu</span>
            </button>
            <button
              onClick={() => {
                setLoading(true);
                setRefreshKey((prev) => prev + 1);
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow border text-gray-800 disabled:opacity-50"
              title="Refresh data"
            >
              <span className="text-sm font-medium">🔄 Refresh</span>
            </button>
          </div>
          {/* Desktop refresh button */}
          <div className="hidden lg:flex justify-end mb-4">
            <button
              onClick={() => {
                setLoading(true);
                setRefreshKey((prev) => prev + 1);
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow border text-gray-800 disabled:opacity-50 hover:bg-gray-50"
              title="Refresh data"
            >
              <span className="text-sm font-medium">🔄 Refresh</span>
            </button>
          </div>
        </div>
        <div className={`p-4 sm:p-6 space-y-6 transition-all ${locked ? "blur-[1.5px] pointer-events-none" : ""}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Today's Bookings"
              value={loading ? "..." : formatNumber(stats.todayBookings)}
              icon={<Clock />}
            />
            <StatCard
              title="Total Bookings"
              value={loading ? "..." : formatNumber(stats.totalBookings)}
              icon={<Wallet />}
            />
            <StatCard
              title="Today's Earnings"
              value={loading ? "..." : formatINR(stats.todayEarnings)}
              icon={<CreditCard />}
            />
            <StatCard
              title="Total Earnings"
              value={loading ? "..." : formatINR(stats.totalEarnings)}
              icon={<CheckCircle />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><SalesChart refreshKey={refreshKey} /></div>
            <div className="lg:col-span-1"><SalesDonutChart refreshKey={refreshKey} /></div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <OrderTable refreshKey={refreshKey} />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-90 bg-black/40 lg:hidden"
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
            {/* Render the same Sidebar inside drawer */}
            <Sidebar />
          </div>
        </>
      )}
    </div>
  );
}
