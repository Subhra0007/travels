"use client";
import React from "react";
import Sidebar from "@/app/components/Pages/admin/Sidebar";
import VendorTable from "@/app/components/Pages/admin/VendorTable";

export default function PartnersAdminPage() {
  return (
    <div className="flex h-screen bg-sky-50 ">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col mt-15">
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-semibold mb-4 text-black">All Partners</h1>
          <VendorTable />
        </main>
      </div>
    </div>
  );
}
