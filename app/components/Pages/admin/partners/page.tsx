// app/admin/partners/page.tsx
"use client";
import React from "react";
import Sidebar from "@/app/components/Pages/admin/Sidebar";

import VendorTable from "@/app/components/Pages/admin/VendorTable";

export default function PartnersAdminPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto mt-15 p-6">
          <h1 className="text-2xl font-semibold mb-4">All Partners</h1>
          <VendorTable />
        </main>
      </div>
    </div>
  );
}
