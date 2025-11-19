// app/properties/adventures/add/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/app/components/Pages/vendor/Sidebar";
import {
  FaMapMarkerAlt,
  FaPlus,
  FaTimes,
  FaUpload,
  FaVideo,
  FaImage,
  FaTrash,
} from "react-icons/fa";
import PageLoader from "@/app/components/common/PageLoader";

const HERO_HIGHLIGHTS = [
  "Expert guide",
  "All equipment provided",
  "Safety gear included",
  "Small group",
  "Insurance covered",
  "Pickup & drop‑off",
  "Meals included",
  "Photography",
  "Beginner‑friendly",
  "Scenic views",
  "Adrenaline rush",
];

const POPULAR_FACILITIES = [
  "Trekking poles",
  "Camping tent",
  "Life jacket",
  "Helmet",
  "First aid kit",
  "Waterproof gear",
  "Sleeping bag",
  "Headlamp",
  "Transport",
  "Snacks & water",
];

const AMENITY_SECTIONS: Array<{
  key: string;
  label: string;
  options: string[];
}> = [
  {
    key: "Equipment",
    label: "Equipment Provided",
    options: [
      "Trekking poles",
      "Backpack",
      "Camping tent",
      "Sleeping bag",
      "Headlamp",
      "Cooking gear",
      "Life jacket",
      "Helmet",
      "Harness",
      "Rope",
      "Climbing shoes",
      "Crampons",
    ],
  },
  {
    key: "Safety",
    label: "Safety",
    options: [
      "First aid kit",
      "Emergency contact",
      "Certified guide",
      "Insurance",
      "Safety briefing",
      "Weather monitoring",
      "GPS tracking",
    ],
  },
  {
    key: "Food & Drink",
    label: "Food & Drink",
    options: [
      "Breakfast",
      "Lunch",
      "Dinner",
      "Snacks",
      "Bottled water",
      "Energy bars",
      "Tea/Coffee",
    ],
  },
  {
    key: "Transport",
    label: "Transport",
    options: [
      "Hotel pickup",
      "4x4 vehicle",
      "Boat transfer",
      "Air‑conditioned bus",
      "Private car",
    ],
  },
];

const DIFFICULTY_LEVELS = ["Easy", "Moderate", "Challenging", "Expert"];
const DURATION_OPTIONS = [
  "2 hours",
  "4 hours",
  "6 hours",
  "8 hours",
  "Full day",
  "2 days",
  "3+ days",
];

type OptionForm = {
  name: string;
  description: string;
  duration: string;
  difficulty: string;
  capacity: number;
  price: number;
  features: string[];
  images: string[];
};

const createDefaultOption = (): OptionForm => ({
  name: "",
  description: "",
  duration: "4 hours",
  difficulty: "Moderate",
  capacity: 10,
  price: 0,
  features: [],
  images: [],
});

export default function AddAdventurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditing = Boolean(editId);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customHighlight, setCustomHighlight] = useState("");
  const [newRule, setNewRule] = useState("");
  const [optionFeatureDrafts, setOptionFeatureDrafts] = useState<Record<number, string>>({});
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(isEditing);

  const [formData, setFormData] = useState({
    name: "",
    category: "trekking" as "trekking" | "hiking" | "camping" | "water-rafting",
    location: {
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      coordinates: { lat: 0, lng: 0 },
    },
    heroHighlights: [] as string[],
    images: [] as string[],
    gallery: [] as string[],
    videos: {
      inside: [] as string[],
      outside: [] as string[],
    },
    popularFacilities: [] as string[],
    amenities: {} as Record<string, string[]>,
    options: [createDefaultOption()],
    about: {
      heading: "",
      description: "",
    },
    vendorMessage: "",
    defaultCancellationPolicy: "",
    defaultHouseRules: [] as string[],
  });

  const setField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayValue = (key: "heroHighlights" | "popularFacilities", value: string) => {
    setFormData((prev) => {
      const coll = prev[key];
      const exists = coll.includes(value);
      return {
        ...prev,
        [key]: exists ? coll.filter((i) => i !== value) : [...coll, value],
      };
    });
  };

  const toggleAmenity = (sectionKey: string, option: string) => {
    setFormData((prev) => {
      const current = prev.amenities[sectionKey] || [];
      const next = current.includes(option)
        ? current.filter((i) => i !== option)
        : [...current, option];
      const amenities = { ...prev.amenities };
      if (next.length) amenities[sectionKey] = next;
      else delete amenities[sectionKey];
      return { ...prev, amenities };
    });
  };

  const updateOption = <K extends keyof OptionForm>(idx: number, key: K, value: OptionForm[K]) => {
    setFormData((prev) => {
      const opts = [...prev.options];
      opts[idx] = { ...opts[idx], [key]: value };
      return { ...prev, options: opts };
    });
  };

  const addOption = () => setFormData((prev) => ({ ...prev, options: [...prev.options, createDefaultOption()] }));
  const removeOption = (idx: number) =>
    setFormData((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }));

  const hydrateForm = (adventure: any) => {
    setFormData({
      name: adventure.name ?? "",
      category: (adventure.category as "trekking" | "hiking" | "camping" | "water-rafting") ?? "trekking",
      location: {
        address: adventure.location?.address ?? "",
        city: adventure.location?.city ?? "",
        state: adventure.location?.state ?? "",
        country: adventure.location?.country ?? "",
        postalCode: adventure.location?.postalCode ?? "",
        coordinates: {
          lat: adventure.location?.coordinates?.lat ?? 0,
          lng: adventure.location?.coordinates?.lng ?? 0,
        },
      },
      heroHighlights: adventure.heroHighlights ?? [],
      images: adventure.images ?? [],
      gallery: adventure.gallery ?? [],
      videos: {
        inside: adventure.videos?.inside ?? [],
        outside: adventure.videos?.outside ?? [],
      },
      popularFacilities: adventure.popularFacilities ?? [],
      amenities: adventure.amenities
        ? Object.fromEntries(Object.entries(adventure.amenities))
        : {},
      options:
        Array.isArray(adventure.options) && adventure.options.length
          ? adventure.options.map((option: any) => ({
              name: option.name ?? "",
              description: option.description ?? "",
              duration: option.duration ?? "4 hours",
              difficulty: option.difficulty ?? "Moderate",
              capacity: option.capacity ?? 0,
              price: option.price ?? 0,
              features: option.features ?? [],
              images: option.images ?? [],
            }))
          : [createDefaultOption()],
      about: {
        heading: adventure.about?.heading ?? "",
        description: adventure.about?.description ?? "",
      },
      vendorMessage: adventure.vendorMessage ?? "",
      defaultCancellationPolicy: adventure.defaultCancellationPolicy ?? "",
      defaultHouseRules: adventure.defaultHouseRules ?? [],
    });
  };

  useEffect(() => {
    if (!editId) return;

    const loadAdventure = async () => {
      setInitializing(true);
      try {
        const res = await fetch(`/api/vendor/adventures?id=${editId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success || !data.adventure) {
          throw new Error(data?.message || "Failed to load adventure details");
        }
        hydrateForm(data.adventure);
      } catch (error: any) {
        alert(error?.message || "Unable to load adventure for editing");
        router.push("/vendor/properties/adventures");
      } finally {
        setInitializing(false);
      }
    };

    loadAdventure();
  }, [editId, router]);

  // ──────────────────────────────────────────────────────
  // Media upload helper
  // ──────────────────────────────────────────────────────
  const uploadMedia = async (files: File[], folder: string) => {
    if (!files.length) return [] as string[];
    setUploadingState((prev) => ({ ...prev, [folder]: true }));
    setUploadError(null);

    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("folder", folder);

    try {
      const res = await fetch("/api/uploads/adventures", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message ?? "Upload failed");
      return (data.uploads || []).map((u: any) => u.url as string);
    } catch (e: any) {
      setUploadError(e?.message ?? "Upload failed");
      return [];
    } finally {
      setUploadingState((prev) => ({ ...prev, [folder]: false }));
    }
  };

  // ──────────────────────────────────────────────────────
  // Property images (min 5)
  // ──────────────────────────────────────────────────────
  const handlePropertyImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `adventures/${formData.category}/property`);
    if (uploaded.length) setFormData((p) => ({ ...p, images: [...p.images, ...uploaded] }));
    e.target.value = "";
  };

  // ──────────────────────────────────────────────────────
  // Gallery images (optional)
  // ──────────────────────────────────────────────────────
  const handleGalleryImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `adventures/${formData.category}/gallery`);
    if (uploaded.length) setFormData((p) => ({ ...p, gallery: [...p.gallery, ...uploaded] }));
    e.target.value = "";
  };

  // ──────────────────────────────────────────────────────
  // Videos – inside / outside
  // ──────────────────────────────────────────────────────
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "inside" | "outside") => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `adventures/${formData.category}/videos/${type}`);
    if (uploaded.length) {
      setFormData((p) => ({
        ...p,
        videos: { ...p.videos, [type]: [...p.videos[type], ...uploaded] },
      }));
    }
    e.target.value = "";
  };

  // ──────────────────────────────────────────────────────
  // Option images (min 3 per option)
  // ──────────────────────────────────────────────────────
  const handleOptionImages = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `adventures/${formData.category}/options/${idx + 1}`);
    if (uploaded.length) updateOption(idx, "images", [...formData.options[idx].images, ...uploaded]);
    e.target.value = "";
  };

  // ──────────────────────────────────────────────────────
  // Media removal helpers
  // ──────────────────────────────────────────────────────
  const removeMedia = (key: "images" | "gallery", i: number) => {
    setFormData((p) => ({ ...p, [key]: p[key].filter((_, idx) => idx !== i) }));
  };
  const removeVideo = (type: "inside" | "outside", i: number) => {
    setFormData((p) => ({
      ...p,
      videos: { ...p.videos, [type]: p.videos[type].filter((_, idx) => idx !== i) },
    }));
  };
  const removeOptionImage = (optIdx: number, imgIdx: number) => {
    updateOption(optIdx, "images", formData.options[optIdx].images.filter((_, i) => i !== imgIdx));
  };

  // ──────────────────────────────────────────────────────
  // Misc helpers
  // ──────────────────────────────────────────────────────
  const addCustomHighlight = () => {
    if (!customHighlight.trim()) return;
    setFormData((p) => ({ ...p, heroHighlights: [...p.heroHighlights, customHighlight.trim()] }));
    setCustomHighlight("");
  };
  const addRule = () => {
    if (!newRule.trim()) return;
    setFormData((p) => ({ ...p, defaultHouseRules: [...p.defaultHouseRules, newRule.trim()] }));
    setNewRule("");
  };
  const removeRule = (i: number) =>
    setFormData((p) => ({ ...p, defaultHouseRules: p.defaultHouseRules.filter((_, idx) => idx !== i) }));

  const addOptionFeature = (idx: number) => {
    const draft = optionFeatureDrafts[idx]?.trim();
    if (!draft) return;
    updateOption(idx, "features", [...formData.options[idx].features, draft]);
    setOptionFeatureDrafts((p) => ({ ...p, [idx]: "" }));
  };
  const removeOptionFeature = (optIdx: number, feat: string) => {
    updateOption(optIdx, "features", formData.options[optIdx].features.filter((f) => f !== feat));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((p) => ({
          ...p,
          location: {
            ...p.location,
            coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          },
        }));
      },
      () => alert("Could not retrieve location")
    );
  };

  // ──────────────────────────────────────────────────────
  // Validation
  // ──────────────────────────────────────────────────────
  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.name.trim()) err.name = "Adventure name required";
    if (!formData.location.address.trim()) err.address = "Address required";
    if (!formData.location.city.trim()) err.city = "City required";
    if (!formData.location.state.trim()) err.state = "State required";
    if (!formData.location.country.trim()) err.country = "Country required";
    if (formData.images.length < 5) err.images = "Upload at least 5 images";
    if (!formData.about.heading.trim()) err.aboutHeading = "About heading required";
    if (!formData.about.description.trim()) err.aboutDesc = "About description required";
    if (!formData.options.length) err.options = "Add at least one option";

    formData.options.forEach((opt, i) => {
      if (!opt.name.trim()) err[`opt-${i}-name`] = "Option name required";
      if (!opt.duration) err[`opt-${i}-duration`] = "Duration required";
      if (!opt.difficulty) err[`opt-${i}-difficulty`] = "Difficulty required";
      if (opt.capacity < 1) err[`opt-${i}-capacity`] = "Capacity ≥ 1";
      if (opt.price <= 0) err[`opt-${i}-price`] = "Price > 0";
      if (opt.images.length < 3) err[`opt-${i}-images`] = "Min 3 images per option";
    });

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ──────────────────────────────────────────────────────
  // Submit
  // ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = editId ? `/api/vendor/adventures?id=${editId}` : "/api/vendor/adventures";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message ?? "Failed");
      router.push("/vendor/properties/adventures");
    } catch (err: any) {
      alert(err?.message ?? "Failed to save adventure");
    } finally {
      setSubmitting(false);
    }
  };

  if (initializing) {
    return <PageLoader />;
  }

  // ──────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-50 text-black overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-sky-50 border-b">
          <div className="flex items-center gap-3 p-3">
            <button
              className="lg:hidden px-3 py-2 rounded border text-gray-700"
              onClick={() => setMobileSidebarOpen(true)}
            >
              Menu
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold">
              {isEditing ? "Edit Adventure" : "Create Adventure"}
            </h1>
          </div>
        </div>

        {/* Main Form */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
            {uploadError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {uploadError}
              </div>
            )}

            {/* ── Basic Info ── */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Adventure Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setField("name", e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., Everest Base Camp Trek"
                  />
                  {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setField("category", e.target.value as any)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="trekking">Trekking</option>
                    <option value="hiking">Hiking</option>
                    <option value="camping">Camping</option>
                    <option value="water-rafting">Water Rafting</option>
                  </select>
                </div>
              </div>
            </section>

            {/* ── Location ── */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Location</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(e) =>
                      setField("location", { ...formData.location, address: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Street & number"
                  />
                  {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location.city}
                      onChange={(e) =>
                        setField("location", { ...formData.location, city: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    {errors.city && <p className="text-red-600 text-sm">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location.state}
                      onChange={(e) =>
                        setField("location", { ...formData.location, state: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    {errors.state && <p className="text-red-600 text-sm">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location.country}
                      onChange={(e) =>
                        setField("location", { ...formData.location, country: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    {errors.country && <p className="text-red-600 text-sm">{errors.country}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={formData.location.postalCode}
                      onChange={(e) =>
                        setField("location", { ...formData.location, postalCode: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FaMapMarkerAlt /> Use current location
                </button>
              </div>
            </section>

            {/* ── Highlights ── */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Highlights</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {HERO_HIGHLIGHTS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => toggleArrayValue("heroHighlights", h)}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      formData.heroHighlights.includes(h)
                        ? "bg-green-50 border-green-500 text-green-700"
                        : "border-gray-300"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customHighlight}
                  onChange={(e) => setCustomHighlight(e.target.value)}
                  placeholder="Custom highlight"
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={addCustomHighlight}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            </section>

            {/* ── Media (Images + Gallery + Videos) ── */}
            <section className="bg-white rounded-xl shadow p-6 space-y-6">
              <h2 className="text-xl font-semibold">Media</h2>

              {/* Property Images */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Adventure Images <span className="text-red-500">*</span> (min 5)
                </label>
                <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500">
                  <FaUpload className="text-green-600" />
                  <span>Choose images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handlePropertyImages}
                  />
                </label>
                {uploadingState[`adventures/${formData.category}/property`] && (
                  <p className="text-sm text-gray-600 mt-1">Uploading…</p>
                )}
                {formData.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-2">
                    {formData.images.map((src, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={src}
                          alt=""
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedia("images", i)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.images && <p className="text-red-600 text-sm mt-1">{errors.images}</p>}
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Gallery Images (optional)
                </label>
                <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500">
                  <FaImage className="text-green-600" />
                  <span>Choose gallery images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleGalleryImages}
                  />
                </label>
                {uploadingState[`adventures/${formData.category}/gallery`] && (
                  <p className="text-sm text-gray-600 mt-1">Uploading…</p>
                )}
                {formData.gallery.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-2">
                    {formData.gallery.map((src, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={src}
                          alt=""
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedia("gallery", i)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Videos – Inside */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Inside Videos (optional)
                </label>
                <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500">
                  <FaVideo className="text-green-600" />
                  <span>Upload inside videos</span>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleVideoUpload(e, "inside")}
                  />
                </label>
                {uploadingState[`adventures/${formData.category}/videos/inside`] && (
                  <p className="text-sm text-gray-600 mt-1">Uploading…</p>
                )}
                {formData.videos.inside.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {formData.videos.inside.map((src, i) => (
                      <div key={i} className="relative group">
                        <video
                          src={src}
                          className="w-full h-24 object-cover rounded"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => removeVideo("inside", i)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Videos – Outside */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Outside Videos (optional)
                </label>
                <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500">
                  <FaVideo className="text-green-600" />
                  <span>Upload outside videos</span>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleVideoUpload(e, "outside")}
                  />
                </label>
                {uploadingState[`adventures/${formData.category}/videos/outside`] && (
                  <p className="text-sm text-gray-600 mt-1">Uploading…</p>
                )}
                {formData.videos.outside.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {formData.videos.outside.map((src, i) => (
                      <div key={i} className="relative group">
                        <video
                          src={src}
                          className="w-full h-24 object-cover rounded"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => removeVideo("outside", i)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ── Popular Facilities ── */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Popular Facilities (quick badges)</h2>
              <div className="flex flex-wrap gap-2">
                {POPULAR_FACILITIES.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleArrayValue("popularFacilities", f)}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      formData.popularFacilities.includes(f)
                        ? "bg-green-50 border-green-500 text-green-700"
                        : "border-gray-300"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </section>

            {/* ── Amenities (grouped) ── */}
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Amenities & Equipment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {AMENITY_SECTIONS.map((sec) => (
                  <div key={sec.key}>
                    <h3 className="font-medium mb-2">{sec.label}</h3>
                    <div className="flex flex-wrap gap-2">
                      {sec.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleAmenity(sec.key, opt)}
                          className={`px-3 py-1 rounded-full text-sm border ${
                            formData.amenities[sec.key]?.includes(opt)
                              ? "bg-green-50 border-green-500 text-green-700"
                              : "border-gray-300"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Adventure Options ── */}
            <section className="bg-white rounded-xl shadow p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Adventure Options</h2>
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FaPlus /> Add Option
                </button>
              </div>

              {formData.options.map((opt, idx) => (
                <div key={idx} className="border rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Option {idx + 1}</h3>
                    {formData.options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={opt.name}
                        onChange={(e) => updateOption(idx, "name", e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                      {errors[`opt-${idx}-name`] && (
                        <p className="text-red-600 text-sm">{errors[`opt-${idx}-name`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Difficulty <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={opt.difficulty}
                        onChange={(e) => updateOption(idx, "difficulty", e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        {DIFFICULTY_LEVELS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      {errors[`opt-${idx}-difficulty`] && (
                        <p className="text-red-600 text-sm">{errors[`opt-${idx}-difficulty`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Duration <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={opt.duration}
                        onChange={(e) => updateOption(idx, "duration", e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        {DURATION_OPTIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      {errors[`opt-${idx}-duration`] && (
                        <p className="text-red-600 text-sm">{errors[`opt-${idx}-duration`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Capacity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={opt.capacity}
                        onChange={(e) => updateOption(idx, "capacity", Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                      {errors[`opt-${idx}-capacity`] && (
                        <p className="text-red-600 text-sm">{errors[`opt-${idx}-capacity`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={opt.price}
                        onChange={(e) => updateOption(idx, "price", Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                      {errors[`opt-${idx}-price`] && (
                        <p className="text-red-600 text-sm">{errors[`opt-${idx}-price`]}</p>
                      )}
                    </div>

                    {/* Option Images */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        Images <span className="text-red-500">*</span> (min 3)
                      </label>
                      <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500">
                        <FaUpload className="text-green-600" />
                        <span>Select images</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleOptionImages(e, idx)}
                        />
                      </label>
                      {uploadingState[`adventures/${formData.category}/options/${idx + 1}`] && (
                        <p className="text-sm text-gray-600 mt-1">Uploading…</p>
                      )}
                      {opt.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {opt.images.map((src, i) => (
                            <div key={i} className="relative group">
                              <img
                                src={src}
                                alt=""
                                className="w-full h-24 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => removeOptionImage(idx, i)}
                                className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {errors[`opt-${idx}-images`] && (
                        <p className="text-red-600 text-sm">{errors[`opt-${idx}-images`]}</p>
                      )}
                    </div>

                    {/* Features (optional) */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        Features (optional)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a feature"
                          value={optionFeatureDrafts[idx] ?? ""}
                          onChange={(e) =>
                            setOptionFeatureDrafts((p) => ({
                              ...p,
                              [idx]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOptionFeature(idx))}
                          className="flex-1 px-4 py-2 border rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => addOptionFeature(idx)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Add
                        </button>
                      </div>
                      {opt.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {opt.features.map((f, fi) => (
                            <span
                              key={fi}
                              className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
                            >
                              {f}
                              <button
                                type="button"
                                onClick={() => removeOptionFeature(idx, f)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTimes className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* ── About & Policies ── */}
            <section className="bg-white rounded-xl shadow p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold">About the Adventure</h2>
                <input
                  type="text"
                  placeholder="Heading *"
                  value={formData.about.heading}
                  onChange={(e) =>
                    setField("about", { ...formData.about, heading: e.target.value })
                  }
                  className="w-full mt-2 px-4 py-2 border rounded-lg"
                />
                {errors.aboutHeading && (
                  <p className="text-red-600 text-sm">{errors.aboutHeading}</p>
                )}
                <textarea
                  rows={5}
                  placeholder="Description *"
                  value={formData.about.description}
                  onChange={(e) =>
                    setField("about", { ...formData.about, description: e.target.value })
                  }
                  className="w-full mt-2 px-4 py-2 border rounded-lg"
                />
                {errors.aboutDesc && <p className="text-red-600 text-sm">{errors.aboutDesc}</p>}
              </div>

              <div>
                <h3 className="text-lg font-semibold">House Rules</h3>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add a rule"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
                    className="flex-1 px-4 py-2 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={addRule}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
                {formData.defaultHouseRules.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gray-100 px-3 py-2 mt-2 rounded"
                  >
                    <span>{r}</span>
                    <button
                      type="button"
                      onClick={() => removeRule(i)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Vendor Message (optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.vendorMessage}
                  onChange={(e) => setField("vendorMessage", e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Default Cancellation Policy (optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.defaultCancellationPolicy}
                  onChange={(e) => setField("defaultCancellationPolicy", e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </section>

            {/* ── Submit / Cancel ── */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-60 hover:bg-green-700"
              >
                {submitting
                  ? isEditing
                    ? "Updating…"
                    : "Saving…"
                  : isEditing
                  ? "Update Adventure"
                  : "Create Adventure"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/vendor/adventures")}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 p-0 lg:hidden overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="text-lg font-semibold">Menu</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="px-3 py-1.5 rounded-md border text-gray-900"
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