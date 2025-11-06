// app/profile/page.tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/profile", {
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const deleteAccount = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;

    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        alert("Account deleted");
        router.push("/");
      }
    } catch (err) {
      alert("Failed to delete account");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!user) return <p className="text-center mt-20">No user found.</p>;

  /* ---------- Avatar with first-letter fallback (no design change) ---------- */
  const Avatar = ({ size = 64 }: { size?: number }) => {
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

  return (
    <div className="flex min-h-screen bg-sky-50 text-black">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6 flex flex-col pt-15">
        <div className="mb-8 flex flex-col items-center space-y-2">
          <Avatar size={64} />
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2 truncate">
            {user.fullName}
          </h2>
          <p className="text-sm text-gray-500 text-center truncate">{user.email}</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-green-50 hover:text-green-600"
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            My Profile
          </button>

          <button
            onClick={() => router.push("/bookings")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
              activeTab === "bookings"
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-green-50 hover:text-green-600"
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            Booking History
          </button>

          <button
            onClick={() => router.push("/wishlist")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
              activeTab === "wishlist"
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-green-50 hover:text-green-600"
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            Wishlist
          </button>

          <button
            onClick={() => router.push("/inbox")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
              activeTab === "inbox"
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-green-50 hover:text-green-600"
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M2.94 6.412A2 2 0 002 8.108V16a2 2 0 002 2h12a2 2 0 002-2V8.108a2 2 0 00-.94-1.696l-6-3.75a2 2 0 00-2.12 0l-6 3.75zm2.615 2.423a1 1 0 10-1.11 1.664l5 3.333a1 1 0 001.11 0l5-3.333a1 1 0 00-1.11-1.664L10 11.798 5.555 8.835z"
                clipRule="evenodd"
              />
            </svg>
            Inbox
          </button>

          <button
            onClick={() => router.push("/support")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
              activeTab === "support"
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-green-50 hover:text-green-600"
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Contact Support
          </button>
        </nav>

        <div className="pt-4 border-t border-gray-100 space-y-2">
          <button
            onClick={deleteAccount}
            className="w-full bg-red-100 hover:bg-red-200 text-red-700 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 011-1h6a1 1 0 110 2H8a1 1 0 01-1-1zm1 4a1 1 0 100 2h6a1 1 0 100-2H8z"
                clipRule="evenodd"
              />
            </svg>
            Delete Account
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L12 15.586l2.293-2.293zM9 11a1 1 0 000-2V7a1 1 0 012 0v2a1 1 0 100 2h2a1 1 0 100-2H9z"
                clipRule="evenodd"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 pt-25">
        {activeTab === "profile" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/")}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-7 0h6"
                    />
                  </svg>
                  Back to Home
                </button>

                <button
                  onClick={() => router.push("/profile/edit")}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="bg-white shadow-xl rounded-3xl p-8">
              <div className="flex gap-6 mb-8">
                <Avatar size={100} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{user.fullName}</h2>
                  <p className="text-gray-500 mt-1">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 text-gray-700">
                <div>
                  <p className="mb-3">
                    <span className="font-semibold text-gray-800">Full Name:</span> {user.fullName}
                  </p>
                  <p className="mb-3">
                    <span className="font-semibold text-gray-800">Phone:</span> {user.contactNumber || "N/A"}
                  </p>
                  <p className="mb-3">
                    <span className="font-semibold text-gray-800">Gender:</span>{" "}
                    {user.additionalDetails?.gender || "N/A"}
                  </p>
                  <p className="mb-3">
                    <span className="font-semibold text-gray-800">Address:</span>{" "}
                    {(() => {
                      const a = user.additionalDetails?.addresses?.[0];
                      if (!a) return "N/A";

                      const parts = [a.street, a.city, a.state].filter(Boolean);
                      return parts.length ? parts.join(", ") : "N/A";
                    })()}
                  </p>
                </div>
                <div>
                  <p className="mb-3">
                    <span className="font-semibold text-gray-800">Email:</span> {user.email}
                  </p>
                  <p className="mb-3">
                    <span className="font-semibold text-gray-800">Age:</span> {user.age || "N/A"}
                  </p>
                  <p className="mb-3">
                    <span className="font-semibold text-gray-800">DOB:</span>{" "}
                    {user.additionalDetails?.dateOfBirth || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">About:</span>{" "}
                    {user.additionalDetails?.about || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}