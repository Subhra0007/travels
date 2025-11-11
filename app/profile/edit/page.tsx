// app/profile/edit/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [newPicture, setNewPicture] = useState<File | null>(null);

  // Show custom input only when "Other" is chosen
  const [showCustomGender, setShowCustomGender] = useState(false);
  const [customGender, setCustomGender] = useState("");

  const [form, setForm] = useState({
    contactNumber: "",
    age: "",
    gender: "",
    about: "",
    dateOfBirth: "",
    addresses: [{ street: "", city: "", state: ""}],
  });

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/profile", { credentials: "include" });
      if (res.status === 401) return router.push("/login");
      const { success, user } = await res.json();
      if (!success) return router.push("/login");

      setUser(user);
      const savedGender = user.additionalDetails?.gender || "";

      const isOther = !["Male", "Female", "Other"].includes(savedGender);
      const displayGender = isOther ? "Other" : savedGender;

      setForm({
        contactNumber: user.contactNumber || "",
        age: user.age?.toString() || "",
        gender: displayGender,
        about: user.additionalDetails?.about || "",
        dateOfBirth: user.additionalDetails?.dateOfBirth || "",
        addresses: user.additionalDetails?.addresses?.length
          ? user.additionalDetails.addresses
          : [{ street: "", city: "", state: ""}],
      });

      if (isOther) {
        setCustomGender(savedGender);
        setShowCustomGender(true);
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const uploadPicture = async () => {
    if (!newPicture) return alert("Please select an image");
    const fd = new FormData();
    fd.append("displayPicture", newPicture);
    const res = await fetch("/api/profile/picture", {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    const data = await res.json();
    if (data.success) {
      alert("Picture updated!");
      fetchUser();
    } else alert(data.message || "Upload failed");
  };

  const removePicture = async () => {
    if (!confirm("Remove profile picture?")) return;
    const res = await fetch("/api/profile/picture/remove", {
      method: "PUT",
      credentials: "include",
    });
    const data = await res.json();
    if (data.success) {
      alert("Picture removed");
      fetchUser();
    }
  };

  const save = async () => {
    const finalGender =
      form.gender === "Other" && customGender.trim()
        ? customGender.trim()
        : form.gender;

    const payload = {
      contactNumber: form.contactNumber,
      age: form.age ? Number(form.age) : undefined,
      additionalDetails: {
        gender: finalGender,
        about: form.about,
        dateOfBirth: form.dateOfBirth,
        addresses: form.addresses,
      },
    };

    const res = await fetch("/api/profile", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      alert("Profile saved!");
      router.push("/profile");
    } else alert("Save failed");
  };

  if (loading)
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );

  const Avatar = () => {
    if (user.avatar) {
      return (
        <Image
          src={user.avatar}
          alt="avatar"
          width={100}
          height={100}
          className="rounded-full border-4 border-green-200 size-20"
        />
      );
    }
    const first = user.fullName?.trim().charAt(0).toUpperCase() ?? "U";
    return (
      <div className="w-[100px] h-[100px] rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl border-4 border-green-200">
        {first}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-sky-50 shadow-xl rounded-3xl mt-20 mb-10">
      <h1 className="text-3xl font-bold mb-8 text-black">Edit Profile</h1>

      {/* Picture */}
      <div className="flex items-center gap-6 mb-8">
        <Avatar />
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewPicture(e.target.files?.[0] ?? null)}
            className="block mb-2 text-gray-900"
          />
          <button
            onClick={uploadPicture}
            className="bg-blue-600 text-white px-4 py-1.5 rounded mr-2"
          >
            Upload
          </button>
          <button
            onClick={removePicture}
            className="bg-red-600 text-white px-4 py-1.5 rounded"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Read-only Name & Email */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Full Name
          </label>
          <input
            type="text"
            value={user.fullName}
            disabled
            className="mt-1 w-full p-2 border rounded bg-gray-100 cursor-not-allowed text-gray-600 border-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Email
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="mt-1 w-full p-2 border rounded bg-gray-100 cursor-not-allowed text-gray-600 border-gray-300"
          />
        </div>
      </div>

      {/* Editable Fields */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Contact Number"
          value={form.contactNumber}
          onChange={(e) =>
            setForm({ ...form, contactNumber: e.target.value })
          }
          className="w-full p-2 border rounded text-gray-600 border-gray-300"
        />
        <input
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
          className="w-full p-2 border rounded text-gray-600 border-gray-300"
        />
        <input
          type="date"
          value={form.dateOfBirth}
          onChange={(e) =>
            setForm({ ...form, dateOfBirth: e.target.value })
          }
          className="w-full p-2 border rounded text-gray-600 border-gray-300"
        />

        {/* Gender */}
        <div className="flex flex-col gap-2">
          <select
            value={form.gender}
            onChange={(e) => {
              const val = e.target.value;
              setForm({ ...form, gender: val });
              setShowCustomGender(val === "Other");
              if (val !== "Other") setCustomGender("");
            }}
            className="w-full p-2 border rounded text-gray-600 border-gray-300"
          >
            {/* Show placeholder only when nothing is selected yet */}
            {!form.gender && <option value="" disabled>Select gender…</option>}
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <textarea
          placeholder="About"
          rows={4}
          value={form.about}
          onChange={(e) => setForm({ ...form, about: e.target.value })}
          className="w-full p-2 border rounded text-gray-600 border-gray-300"
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            key="street"
            placeholder="Street"
            value={form.addresses[0].street}
            onChange={(e) =>
              setForm({
                ...form,
                addresses: [{ ...form.addresses[0], street: e.target.value }],
              })
            }
            className="p-2 border rounded text-gray-600 border-gray-300"
          />
          <input
            key="city"
            placeholder="City"
            value={form.addresses[0].city}
            onChange={(e) =>
              setForm({
                ...form,
                addresses: [{ ...form.addresses[0], city: e.target.value }],
              })
            }
            className="p-2 border rounded text-gray-600 border-gray-300"
          />
          <input
            key="state"
            placeholder="State"
            value={form.addresses[0].state}
            onChange={(e) =>
              setForm({
                ...form,
                addresses: [{ ...form.addresses[0], state: e.target.value }],
              })
            }
            className="p-2 border rounded text-gray-600 border-gray-300"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={() => router.push("/profile")}
          className="px-5 py-2 bg-gray-500 text-white rounded"
        >
          Cancel
        </button>
        <button
          onClick={save}
          className="px-6 py-2 bg-green-600 text-white rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}