//app/components/pages/admin/Dashboard.tsx
import React from "react";
import StatCard from "./StatCard";
import VendorTable from "./VendorTable";

const Dashboard: React.FC = () => {
  return (
    <div className="p-6 text-gray-900">
      <h1 className="text-2xl font-semibold mb-2">Hi 👋</h1>
      <p className="text-gray-800 mb-6">Welcome to your dashboard!</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Users" value="14,890" color="bg-indigo-500" />
        <StatCard title="Total Orders" value="55,450" color="bg-yellow-500" />
        <StatCard title="Total Vendors" value="6,652" color="bg-red-400" />
        <StatCard title="Total Earnings" value="₹31,160" color="bg-green-500" />
      </div>

      <VendorTable />
    </div>
  );
};

export default Dashboard;
