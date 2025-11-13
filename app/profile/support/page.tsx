"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaBars } from "react-icons/fa";

export default function SupportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myMessages, setMyMessages] = useState<any[]>([]);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch("/api/auth/verify", { credentials: "include" });
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        if (data.user.accountType === "vendor") {
          router.replace("/vendor");
          return;
        }
        setUser(data.user);
        loadMessages();
      } catch (err) {
        console.error("Verify failed:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    verifyUser();
  }, [router]);

  const loadMessages = async () => {
    try {
      const res = await fetch("/api/support", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setMyMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject, message }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit support request");
      }

      setSuccess(true);
      setSubject("");
      setMessage("");
      await loadMessages();
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to submit support request");
    } finally {
      setSubmitting(false);
    }
  };

  const Avatar = ({ size = 64 }: { size?: number }) => {
    if (!user) return null;
    if (user.avatar) {
      return (
        <Image
          src={user.avatar}
          alt="Profile"
          width={size}
          height={size}
          className="rounded-full border-4 border-green-200"
          style={{ width: size, height: size }}
        />
      );
    }
    const first = user.fullName?.trim().charAt(0).toUpperCase() ?? "U";
    return (
      <div
        className="rounded-full border-4 border-green-200 flex items-center justify-center text-white font-bold"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.45,
          background: "linear-gradient(to bottom right, #a855f7, #ec4899)",
        }}
      >
        {first}
      </div>
    );
  };

  if (loading)
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  if (!user) return <p className="text-center mt-20">No user found.</p>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-sky-50 text-black">
      {/* Sidebar - Always visible */}
      <div className="lg:block hidden">
        <div className="w-full md:w-64 bg-white shadow-lg p-6 flex flex-col pt-20">
          <div className="mb-8 flex flex-col items-center space-y-2">
            <div className="hidden md:block">
              <Avatar size={64} />
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2 truncate">
              {user.fullName}
            </h2>
            <p className="text-sm text-gray-500 text-center truncate">{user.email}</p>
          </div>

          <nav className="flex-1 space-y-2">
            <button
              onClick={() => router.push("/profile")}
              className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              My Profile
            </button>

            <button
              onClick={() => router.push("/bookings")}
              className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Booking History
            </button>

            <button
              onClick={() => router.push("/wishlist")}
              className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              Wishlist
            </button>

            <button
              onClick={() => router.push("/profile/inbox")}
              className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.94 6.412A2 2 0 002 8.108V16a2 2 0 002 2h12a2 2 0 002-2V8.108a2 2 0 00-.94-1.696l-6-3.75a2 2 0 00-2.12 0l-6 3.75zm2.615 2.423a1 1 0 10-1.11 1.664l5 3.333a1 1 0 001.11 0l5-3.333a1 1 0 00-1.11-1.664L10 11.798 5.555 8.835z" clipRule="evenodd" />
              </svg>
              Inbox
            </button>

            <button
              onClick={() => router.push("/profile/support")}
              className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 bg-linear-to-r from-green-500 to-green-600 text-white shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Contact Support
            </button>
          </nav>

          <div className="pt-4 border-t border-gray-100 space-y-2">
            <button
              onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
                localStorage.removeItem("user");
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
                }
                window.location.href = "/";
              }}
              className="w-full bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L12 15.586l2.293-2.293zM9 11a1 1 0 000-2V7a1 1 0 012 0v2a1 1 0 100 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-10 pt-20">
        <div className="md:hidden mb-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow border text-gray-800"
          >
            <FaBars />
            <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Contact Support</h1>

          {success && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
              Your support request has been submitted successfully! We'll get back to you soon.
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
              {error}
            </div>
          )}

          <div className="bg-white shadow-xl rounded-3xl p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Send a Support Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="What is your issue about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Please describe your issue in detail..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Support Request"}
              </button>
            </form>
          </div>

          {/* My Support Messages */}
          <div className="bg-white shadow-xl rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">My Support Requests</h2>
            {myMessages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No support requests yet.</p>
            ) : (
              <div className="space-y-4">
                {myMessages.map((msg: any) => (
                  <div
                    key={msg._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{msg.subject}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          msg.status === "open"
                            ? "bg-yellow-100 text-yellow-700"
                            : msg.status === "replied"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{msg.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                    {msg.adminReply && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-1">Admin Reply:</p>
                        <p className="text-gray-600 text-sm">{msg.adminReply}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Replied on {new Date(msg.repliedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-90 bg-black/40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-100 p-6 md:hidden overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">Menu</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="px-3 py-1.5 rounded-md border text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="mb-8 flex flex-col items-center space-y-2">
              <Avatar size={56} />
              <h2 className="text-base font-bold text-center text-gray-800 truncate">
                {user.fullName}
              </h2>
              <p className="text-xs text-gray-500 text-center truncate">{user.email}</p>
            </div>
            <nav className="space-y-2">
              <button
                onClick={() => {
                  router.push("/profile");
                  setMobileSidebarOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                My Profile
              </button>
              <button
                onClick={() => {
                  router.push("/profile/inbox");
                  setMobileSidebarOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.94 6.412A2 2 0 002 8.108V16a2 2 0 002 2h12a2 2 0 002-2V8.108a2 2 0 00-.94-1.696l-6-3.75a2 2 0 00-2.12 0l-6 3.75zm2.615 2.423a1 1 0 10-1.11 1.664l5 3.333a1 1 0 001.11 0l5-3.333a1 1 0 00-1.11-1.664L10 11.798 5.555 8.835z" clipRule="evenodd" />
                </svg>
                Inbox
              </button>
              <button
                onClick={() => {
                  router.push("/profile/support");
                  setMobileSidebarOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 bg-linear-to-r from-green-500 to-green-600 text-white shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Contact Support
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}

