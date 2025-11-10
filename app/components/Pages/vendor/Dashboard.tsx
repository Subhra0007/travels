// app/components/Pages/vendor/Dashboard.tsx
"use client";

import Sidebar from "./Sidebar";
import StatCard from "./StatCard";
import SalesChart from "./SalesChart";
import OrderTable from "./OrderTable";
import PaymentTable from "./PaymentTable";
import SalesDonutChart from "./SalesDonutChart";
import { CreditCard, Wallet, Clock, CheckCircle } from "lucide-react";

export default function Dashboard({ locked }: { locked: boolean }) {
  return (
    <div className="min-h-screen bg-gray-100 flex relative ">
      {locked && (
        <div className="absolute inset-0 z-10 backdrop-blur-[2px] pointer-events-none" />
      )}

      {locked && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="bg-white/90 shadow-xl p-6 rounded-xl border text-center max-w-sm">
            <h2 className="text-2xl font-bold text-gray-800">Vendor Dashboard Locked</h2>
            <p className="mt-2 text-gray-600">Your account is under review. Please wait for admin approval.</p>
          </div>
        </div>
      )}

   <Sidebar />

     

      <div className="flex-1 my-20 overflow-y-auto">
        <div className={`p-6 space-y-6 transition-all ${locked ? "blur-[1.5px] pointer-events-none" : ""}`}>
          <div className="grid grid-cols-4 gap-4">
            <StatCard title="Recent Orders" value="500" icon={<Clock />} />
            <StatCard title="Daily Sales" value="₹2,00,000" icon={<Wallet />} />
            <StatCard title="Pending Payments" value="₹1,50,000" icon={<CreditCard />} />
            <StatCard title="Received Payments" value="₹3,50,000" icon={<CheckCircle />} />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2"><SalesChart /></div>
            <div className="col-span-1"><SalesDonutChart /></div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <OrderTable />
            <PaymentTable />
          </div>
        </div>
      </div>
    </div>
  );
}
