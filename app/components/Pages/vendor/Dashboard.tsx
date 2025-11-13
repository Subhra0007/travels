// app/components/Pages/vendor/Dashboard.tsx
"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import StatCard from "./StatCard";
import SalesChart from "./SalesChart";
import OrderTable from "./OrderTable";
import PaymentTable from "./PaymentTable";
import SalesDonutChart from "./SalesDonutChart";
import { CreditCard, Wallet, Clock, CheckCircle } from "lucide-react";
import { FaBars } from "react-icons/fa";

export default function Dashboard({ locked }: { locked: boolean }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
          {/* Mobile/sidebar toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow border text-gray-800"
            >
              <FaBars />
              <span className="text-sm font-medium">Menu</span>
            </button>
          </div>
        </div>
        <div className={`p-4 sm:p-6 space-y-6 transition-all ${locked ? "blur-[1.5px] pointer-events-none" : ""}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title="Recent Orders" value="500" icon={<Clock />} />
            <StatCard title="Daily Sales" value="₹2,00,000" icon={<Wallet />} />
            <StatCard title="Pending Payments" value="₹1,50,000" icon={<CreditCard />} />
            <StatCard title="Received Payments" value="₹3,50,000" icon={<CheckCircle />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><SalesChart /></div>
            <div className="lg:col-span-1"><SalesDonutChart /></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrderTable />
            <PaymentTable />
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
