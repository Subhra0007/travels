"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AdditionalDetails = {
  dateOfBirth?: string;
  gender?: string;
  about?: string;
  addresses?: Array<{
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  }>;
};

type VendorUser = {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  contactNumber?: string;
  accountType: "vendor";
  additionalDetails?: AdditionalDetails;
  vendorServices?: string[];
  isVendorApproved?: boolean;
};

export default function VendorProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<VendorUser | null>(null);

  // Verify vendor session and hydrate profile
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/auth/verify", { credentials: "include" });
        if (res.status !== 200) {
          router.replace("/login");
          return;
        }
        const data = await res.json().catch(() => null);
        const verifiedUser = data?.user;
        if (!res.ok || !verifiedUser) {
          router.replace("/login");
          return;
        }
        if (verifiedUser.accountType !== "vendor") {
          router.replace("/login");
          return;
        }

        let base: VendorUser = verifiedUser;

        // Merge vendor services/approval from admin vendor endpoint (if available)
        const vendorId = base._id || base.id;
        if (vendorId) {
          try {
            const vRes = await fetch(`/api/admin/vendors?id=${vendorId}`);
            const vData = await vRes.json();
            if (vData?.success && vData?.vendor) {
              base = {
                ...base,
                vendorServices: vData.vendor.vendorServices || base.vendorServices,
                isVendorApproved:
                  typeof vData.vendor.isVendorApproved === "boolean"
                    ? vData.vendor.isVendorApproved
                    : base.isVendorApproved,
              };
            }
          } catch {
            // ignore vendor fetch errors, still show basic profile
          }
        }

        setUser(base);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  if (loading)
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );

  if (!user) return null;

  const addr = user.additionalDetails?.addresses?.[0];
  const locationParts = [
    addr?.street,
    addr?.city,
    addr?.state,
    addr?.country,
    addr?.postalCode,
  ].filter(Boolean);
  const location = locationParts.length ? locationParts.join(", ") : "N/A";

  const dob =
    user.additionalDetails?.dateOfBirth
      ? new Date(user.additionalDetails.dateOfBirth).toLocaleDateString()
      : "N/A";

  const gender = user.additionalDetails?.gender || "N/A";
  const bio = user.additionalDetails?.about || "N/A";

  const services = (user.vendorServices || []).map((s) =>
    s === "vehicle" ? "Vehicle Rental" : s.charAt(0).toUpperCase() + s.slice(1)
  );

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Vendor Profile</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/vendor/profile/edit")}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition-all duration-200"
            >
              Edit Profile
            </button>
            <button
              onClick={() => router.push("/vendor")}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition-all duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <span className="font-semibold text-gray-800">Name:</span> {user.fullName}
              </p>
              <p>
                <span className="font-semibold text-gray-800">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-semibold text-gray-800">Phone:</span>{" "}
                {user.contactNumber || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-gray-800">Approval:</span>{" "}
                {user.isVendorApproved ? (
                  <span className="text-green-600 font-semibold">Approved</span>
                ) : (
                  <span className="text-orange-600 font-semibold">Pending</span>
                )}
              </p>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Details</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <span className="font-semibold text-gray-800">Location:</span> {location}
              </p>
              <p>
                <span className="font-semibold text-gray-800">Date of Birth:</span> {dob}
              </p>
              <p>
                <span className="font-semibold text-gray-800">Gender:</span> {gender}
              </p>
              <div>
                <span className="font-semibold text-gray-800">Bio:</span>
                <p className="mt-1 text-gray-700">{bio}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-2xl shadow p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Services Provided</h2>
          {services.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {services.map((svc, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium"
                >
                  {svc}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No services selected yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}


