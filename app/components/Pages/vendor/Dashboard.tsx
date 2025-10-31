"use client";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import StatCard from "./StatCard";
import SalesChart from "./SalesChart";
import OrderTable from "./OrderTable";
import PaymentTable from "./PaymentTable";
import SalesDonutChart from "./SalesDonutChart";
import { CreditCard, Wallet, Clock, CheckCircle } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <div className="flex-1 ml-60">
        <Topbar />

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <StatCard title="Recent Orders" value="500" icon={<Clock />} />
            <StatCard title="Daily Sales" value="₹2,00,000" icon={<Wallet />} />
            <StatCard title="Pending Payments" value="₹1,50,000" icon={<CreditCard />} />
            <StatCard title="Received Payments" value="₹3,50,000" icon={<CheckCircle />} />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <SalesChart />
            </div>

            <div className="col-span-1">
              <SalesDonutChart />
            </div>
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
