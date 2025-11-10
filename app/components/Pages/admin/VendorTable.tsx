// app/components/Pages/admin/Vender.tsx
"use client";
import React, { useEffect, useState } from "react";
import { FaEye, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

interface Vendor {
  _id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  vendorServices: string[];
  createdAt: string;
  isVendorApproved: boolean;
}

const VendorTable: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      const res = await fetch("/api/admin/vendors");
      const data = await res.json();
      if (data.success) setVendors(data.vendors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (vendorId: string, action: "accept" | "reject") => {
    const res = await fetch("/api/admin/vendors", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId, action }),
    });

    const data = await res.json();

    if (data.success) {
      // Update localStorage if this is the logged-in vendor
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user?._id === vendorId) {
        localStorage.setItem("user", JSON.stringify(data.vendor));
      }
      fetchVendors();
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  if (loading) return <p className="text-center py-8">Loading vendors...</p>;

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">All Vendors</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-gray-600">
          <thead>
            <tr className="border-b text-sm text-gray-700">
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Services</th>
              <th>Signup Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v._id} className="border-b hover:bg-gray-50">
                <td className="py-3 font-medium text-gray-800">{v.fullName}</td>
                <td>{v.email}</td>
                <td>{v.contactNumber}</td>
                <td className="py-3">
                  {v.vendorServices && v.vendorServices.length > 0
                    ? v.vendorServices.join(", ")
                    : "—"}
                </td>
                <td>{new Date(v.createdAt).toLocaleString("en-IN")}</td>
                <td className="text-right py-3">
                  {!v.isVendorApproved ? (
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleAction(v._id, "accept")}
                        className="text-green-600 hover:text-green-700"
                        title="Accept"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => handleAction(v._id, "reject")}
                        className="text-red-500 hover:text-red-600"
                        title="Reject"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-3">
                      <FaEye className="cursor-pointer text-indigo-600" title="View" />
                      <FaEdit className="cursor-pointer text-yellow-500" title="Edit" />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorTable;