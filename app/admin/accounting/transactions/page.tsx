"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Pages/admin/Sidebar";
import { FaCheckCircle, FaClock, FaTimesCircle, FaSpinner } from "react-icons/fa";

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [activeTab, setActiveTab] = useState<"create" | "manage">("create");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  
  const [formData, setFormData] = useState({
    vendorId: "",
    message: "",
    amount: "",
    currency: "INR",
    scheduledDate: "",
    notes: "",
  });

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify", { credentials: "include" });
        if (res.status !== 200) return router.replace("/login");
        const data = await res.json();
        if (data.user.accountType !== "admin") return router.replace("/login");
        setAuthorized(true);
        loadVendors();
        loadTransactions();
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [router]);

  const loadVendors = async () => {
    try {
      setLoadingVendors(true);
      const res = await fetch("/api/admin/vendors", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setVendors(data.vendors || []);
      }
    } catch (err) {
      console.error("Failed to load vendors", err);
    } finally {
      setLoadingVendors(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const res = await fetch("/api/admin/transactions", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleStatusChange = async (transactionId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      await loadTransactions();
      alert("Status updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle className="text-green-500" size={16} />;
      case "processing":
        return <FaSpinner className="text-blue-500 animate-spin" size={16} />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500" size={16} />;
      default:
        return <FaClock className="text-yellow-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vendorId || !formData.message || !formData.scheduledDate) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          vendorId: formData.vendorId,
          message: formData.message,
          amount: formData.amount ? parseFloat(formData.amount) : undefined,
          currency: formData.currency,
          scheduledDate: new Date(formData.scheduledDate).toISOString(),
          notes: formData.notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create transaction");
      }

      // Reset form
      setFormData({
        vendorId: "",
        message: "",
        amount: "",
        currency: "INR",
        scheduledDate: "",
        notes: "",
      });

      // Reload transactions and switch to manage tab
      await loadTransactions();
      setActiveTab("manage");
      alert("Transaction created successfully! The vendor will see it on their payments page.");
    } catch (err: any) {
      alert(err.message || "Failed to create transaction");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  if (!authorized) return null;

  return (
    <div className="flex h-screen bg-gray-50 relative">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col mt-15">
        <div className="sticky top-0 z-40 bg-sky-50">
          <div className="flex items-center gap-3 p-3 border-b">
            <button
              className="lg:hidden px-3 py-2 rounded border text-gray-700"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-hidden p-6">
          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "create"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              Create Transaction
            </button>
            <button
              onClick={() => {
                setActiveTab("manage");
                loadTransactions();
              }}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "manage"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              Manage Transactions
            </button>
          </div>

          {activeTab === "create" ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Vendor Selection */}
                <div>
                  <label htmlFor="vendorId" className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor <span className="text-red-500">*</span>
                  </label>
                  {loadingVendors ? (
                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                  ) : (
                    <select
                      id="vendorId"
                      value={formData.vendorId}
                      onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select a vendor</option>
                      {vendors.map((vendor) => (
                        <option key={vendor._id} value={vendor._id}>
                          {vendor.fullName} ({vendor.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter transaction message..."
                  />
                </div>

                {/* Amount */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (Optional)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {/* Currency */}
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                {/* Scheduled Date */}
                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Additional notes..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Submit Transaction"}
                  </button>
                </div>
              </form>
            </div>
          </div>
          ) : (
          <div className="max-w-6xl mx-auto">
            {loadingTransactions ? (
              <div className="flex justify-center py-16">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No transactions found.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vendor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((txn: any) => (
                        <tr key={txn._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(txn.status)}
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  txn.status
                                )}`}
                              >
                                {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {txn.vendorId && typeof txn.vendorId === "object"
                                ? txn.vendorId.fullName || txn.vendorId.email
                                : "Unknown"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-md truncate">
                              {txn.message}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {txn.amount
                                ? `${txn.currency || "INR"} ${txn.amount.toLocaleString()}`
                                : "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(txn.createdAt)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={txn.status}
                              onChange={(e) => handleStatusChange(txn._id, e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar */}
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

