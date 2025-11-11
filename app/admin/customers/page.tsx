"use client";
import { useState } from "react";
import Sidebar from "@/app/components/Pages/admin/Sidebar";
import CustomerTable from "@/app/components/Pages/admin/CustomerTable";

export default function CustomersAdminPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-sky-50 relative">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col mt-15">
        {/* Top bar with mobile trigger */}
        <div className="sticky top-0 z-40 bg-sky-50">
          <div className="flex items-center gap-3 p-3 border-b">
            <button
              className="lg:hidden px-3 py-2 rounded border text-gray-700"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-black">All Customers</h1>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-hidden p-4 sm:p-6">
          <CustomerTable />
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 p-0 lg:hidden overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">Menu</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="px-3 py-1.5 rounded-md border text-gray-700"
              >
                Close
              </button>
            </div>
            <Sidebar />
          </div>
        </>
      )}
    </div>
  );
}


