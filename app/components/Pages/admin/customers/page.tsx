// app/admin/customers/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "@/app/components/Pages/admin/Sidebar";

export default function CustomersAdminPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      setCustomers(data.users || []);
    } catch (err) {
      console.error("Fetch customers error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto mt-15 p-6">
          <h1 className="text-2xl font-semibold mb-4">All Customers</h1>

          <div className="bg-white rounded-xl shadow p-6">
            <table className="w-full text-left text-gray-700">
              <thead className="border-b bg-gray-100">
                <tr>
                  <th className="py-2 px-3 text-left">Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Signup Date</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="py-4 text-center">Loading...</td></tr>
                ) : customers.length === 0 ? (
                  <tr><td colSpan={4} className="py-4 text-center">No customers found</td></tr>
                ) : (
                  customers.map((u) => (
                    <tr key={u._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3">{u.fullName}</td>
                      <td>{u.email}</td>
                      <td>{u.contactNumber}</td>
                      <td>{new Date(u.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
