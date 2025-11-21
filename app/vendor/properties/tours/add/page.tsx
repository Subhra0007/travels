// app/properties/tours/add/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/app/components/Pages/vendor/Sidebar";
import { FaMapMarkerAlt, FaPlus, FaTimes, FaUpload } from "react-icons/fa";
import PageLoader from "@/app/components/common/PageLoader";

const HERO_HIGHLIGHTS = [
  "Guided tour",
  "All-inclusive",
  "Free cancellation",
  "Private group",
  "Skip the line",
  "Live guide",
  "Hotel pickup",
  "Instant confirmation",
  "Wheelchair accessible",
  "Small group",
  "Cultural experience",
];

const POPULAR_FACILITIES = [
  "Transportation",
  "Meals included",
  "Entrance fees",
  "Professional guide",
  "Insurance",
  "Bottled water",
  "Snacks",
  "Photos included",
  "Audio guide",
  "WiFi on board",
];

const AMENITY_SECTIONS: Array<{
  key: string;
  label: string;
  options: string[];
}> = [
  {
    key: "Inclusions",
    label: "Inclusions",
    options: [
      "Hotel pickup and drop-off",
      "Air-conditioned vehicle",
      "All entrance fees",
      "Lunch",
      "Bottled water",
      "Snacks",
      "Professional guide",
      "Insurance",
      "Gratuities",
    ],
  },
  {
    key: "Activities",
    label: "Activities",
    options: [
      "Sightseeing",
      "Cultural tour",
      "Historical sites",
      "Nature walk",
      "Boat ride",
      "Wildlife safari",
      "Photography stops",
      "Shopping time",
    ],
  },
  {
    key: "Accessibility",
    label: "Accessibility",
    options: [
      "Wheelchair accessible",
      "Stroller accessible",
      "Infant seats available",
      "Near public transportation",
    ],
  },
  {
    key: "Language",
    label: "Language",
    options: [
      "English",
      "Spanish",
      "French",
      "German",
      "Mandarin",
      "Hindi",
      "Arabic",
    ],
  },
  {
    key: "Safety",
    label: "Safety",
    options: [
      "First aid kit",
      "Emergency contact",
      "Licensed operator",
      "COVID-19 safety measures",
    ],
  },
];

const DURATION_OPTIONS = [
  "1 hour",
  "2 hours",
  "3 hours",
  "4 hours",
  "5 hours",
  "6 hours",
  "8 hours",
  "Full day (8+ hours)",
  "Multi-day",
];

type OptionForm = {
  name: string;
  description: string;
  duration: string;
  capacity: number;
  price: number;
  features: string[];
  images: string[];
};

const createDefaultOption = (): OptionForm => ({
  name: "",
  description: "",
  duration: "3 hours",
  capacity: 10,
  price: 0,
  features: [],
  images: [],
});

export default function AddTourPage() {
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
    category: "group-tours" as "group-tours" | "tour-packages",
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
      const collection = prev[key];
      const exists = collection.includes(value);
      return {
        ...prev,
        [key]: exists ? collection.filter((item) => item !== value) : [...collection, value],
      };
    });
  };

  const toggleAmenity = (sectionKey: string, option: string) => {
    setFormData((prev) => {
      const current = prev.amenities[sectionKey] || [];
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      const amenities = { ...prev.amenities };
      if (next.length) amenities[sectionKey] = next;
      else delete amenities[sectionKey];
      return { ...prev, amenities };
    });
  };

  const updateOption = <K extends keyof OptionForm>(index: number, key: K, value: OptionForm[K]) => {
    setFormData((prev) => {
      const options = [...prev.options];
      options[index] = { ...options[index], [key]: value };
      return { ...prev, options };
    });
  };

  const addOption = () => {
    setFormData((prev) => ({ ...prev, options: [...prev.options, createDefaultOption()] }));
  };

  const removeOption = (index: number) => {
    setFormData((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));
  };

  const hydrateForm = (tour: any) => {
    setFormData({
      name: tour.name ?? "",
      category: (tour.category as "group-tours" | "tour-packages") ?? "group-tours",
      location: {
        address: tour.location?.address ?? "",
        city: tour.location?.city ?? "",
        state: tour.location?.state ?? "",
        country: tour.location?.country ?? "",
        postalCode: tour.location?.postalCode ?? "",
        coordinates: {
          lat: tour.location?.coordinates?.lat ?? 0,
          lng: tour.location?.coordinates?.lng ?? 0,
        },
      },
      heroHighlights: tour.heroHighlights ?? [],
      images: tour.images ?? [],
      gallery: tour.gallery ?? [],
      videos: {
        inside: tour.videos?.inside ?? [],
        outside: tour.videos?.outside ?? [],
      },
      popularFacilities: tour.popularFacilities ?? [],
      amenities: tour.amenities
        ? Object.fromEntries(Object.entries(tour.amenities))
        : {},
      options:
        Array.isArray(tour.options) && tour.options.length
          ? tour.options.map((option: any) => ({
              name: option.name ?? "",
              description: option.description ?? "",
              duration: option.duration ?? "3 hours",
              capacity: option.capacity ?? 0,
              price: option.price ?? 0,
              features: option.features ?? [],
              images: option.images ?? [],
            }))
          : [createDefaultOption()],
      about: {
        heading: tour.about?.heading ?? "",
        description: tour.about?.description ?? "",
      },
      vendorMessage: tour.vendorMessage ?? "",
      defaultCancellationPolicy: tour.defaultCancellationPolicy ?? "",
      defaultHouseRules: tour.defaultHouseRules ?? [],
    });
  };

  useEffect(() => {
    if (!editId) return;

    const loadTour = async () => {
      setInitializing(true);
      try {
        const res = await fetch(`/api/vendor/tours?id=${editId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success || !data.tour) {
          throw new Error(data?.message || "Failed to load tour details");
        }
        hydrateForm(data.tour);
      } catch (error: any) {
        alert(error?.message || "Unable to load tour for editing");
        router.push("/vendor/properties/tours");
      } finally {
        setInitializing(false);
      }
    };

    loadTour();
  }, [editId, router]);

  const uploadMedia = async (files: File[], folder: string) => {
    if (!files.length) return [] as string[];
    setUploadingState((prev) => ({ ...prev, [folder]: true }));
    setUploadError(null);

    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    form.append("folder", folder);

    try {
      const res = await fetch("/api/uploads/tours", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to upload media");
      }
      return (data.uploads || []).map((item: any) => item.url as string);
    } catch (error: any) {
      setUploadError(error?.message || "Upload failed. Please try again.");
      return [];
    } finally {
      setUploadingState((prev) => ({ ...prev, [folder]: false }));
    }
  };

  const handlePropertyImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `tours/${formData.category}/property`);
    if (uploaded.length) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
    }
    event.target.value = "";
  };

  const handleGalleryImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `tours/${formData.category}/gallery`);
    if (uploaded.length) {
      setFormData((prev) => ({ ...prev, gallery: [...prev.gallery, ...uploaded] }));
    }
    event.target.value = "";
  };

  const handleVideoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    key: "inside" | "outside"
  ) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `tours/${formData.category}/videos/${key}`);
    if (uploaded.length) {
      setFormData((prev) => ({
        ...prev,
        videos: {
          ...prev.videos,
          [key]: [...prev.videos[key], ...uploaded],
        },
      }));
    }
    event.target.value = "";
  };

  const handleOptionImages = async (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `tours/${formData.category}/options/${index + 1}`);
    if (uploaded.length) {
      setFormData((prev) => {
        const options = [...prev.options];
        options[index] = { ...options[index], images: [...options[index].images, ...uploaded] };
        return { ...prev, options };
      });
    }
    event.target.value = "";
  };

  const removeMedia = (key: "images" | "gallery", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const removeVideo = (key: "inside" | "outside", index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: {
        ...prev.videos,
        [key]: prev.videos[key].filter((_, i) => i !== index),
      },
    }));
  };

  const removeOptionImage = (optionIndex: number, imageIndex: number) => {
    setFormData((prev) => {
      const options = [...prev.options];
      options[optionIndex] = {
        ...options[optionIndex],
        images: options[optionIndex].images.filter((_, i) => i !== imageIndex),
      };
      return { ...prev, options };
    });
  };

  const addRule = () => {
    if (!newRule.trim()) return;
    setFormData((prev) => ({
      ...prev,
      defaultHouseRules: [...prev.defaultHouseRules, newRule.trim()],
    }));
    setNewRule("");
  };

  const removeRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      defaultHouseRules: prev.defaultHouseRules.filter((_, i) => i !== index),
    }));
  };

  const addCustomHighlight = () => {
    if (!customHighlight.trim()) return;
    setFormData((prev) => ({
      ...prev,
      heroHighlights: [...prev.heroHighlights, customHighlight.trim()],
    }));
    setCustomHighlight("");
  };

  const addOptionFeature = (index: number) => {
    const draft = optionFeatureDrafts[index]?.trim();
    if (!draft) return;
    setFormData((prev) => {
      const options = [...prev.options];
      if (!options[index].features.includes(draft)) {
        options[index] = {
          ...options[index],
          features: [...options[index].features, draft],
        };
      }
      return { ...prev, options };
    });
    setOptionFeatureDrafts((prev) => ({ ...prev, [index]: "" }));
  };

  const removeOptionFeature = (optionIndex: number, feature: string) => {
    setFormData((prev) => {
      const options = [...prev.options];
      options[optionIndex] = {
        ...options[optionIndex],
        features: options[optionIndex].features.filter((item) => item !== feature),
      };
      return { ...prev, options };
    });
  };

  const handleGetLocation = async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          },
        }));
      },
      () => {
        alert("Could not get location. Enter manually if needed.");
      }
    );
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Tour name is required";
    if (!formData.location.address.trim()) errs.address = "Address is required";
    if (!formData.location.city.trim()) errs.city = "City is required";
    if (!formData.location.state.trim()) errs.state = "State is required";
    if (!formData.location.country.trim()) errs.country = "Country is required";
    if (formData.images.length < 5) errs.images = "Upload at least 5 tour images";
    if (!formData.about.heading.trim()) errs.aboutHeading = "About heading is required";
    if (!formData.about.description.trim()) errs.aboutDescription = "Tour description is required";
    if (!formData.options.length) errs.options = "Add at least one tour option";

    formData.options.forEach((opt, idx) => {
      if (!opt.name.trim()) errs[`option-${idx}-name`] = "Option name is required";
      if (!opt.duration) errs[`option-${idx}-duration`] = "Duration is required";
      if (opt.capacity < 1) errs[`option-${idx}-capacity`] = "Capacity must be at least 1";
      if (opt.price <= 0) errs[`option-${idx}-price`] = "Price must be greater than 0";
      if (opt.images.length < 3) errs[`option-${idx}-images`] = "Upload at least 3 images per option";
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setUploadError(null);

    try {
      const endpoint = editId ? `/api/vendor/tours?id=${editId}` : "/api/vendor/tours";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to create tour");
      }
      router.push("/vendor/properties/tours");
    } catch (error: any) {
      alert(error?.message || "Failed to save tour");
    } finally {
      setSubmitting(false);
    }
  };

  if (initializing) {
    return <PageLoader />;
  }

  return (
    <div className="flex h-screen bg-gray-50 text-black relative">
      <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen pt-15 overflow-y-auto">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col mt-15">
        <div className="sticky top-0 z-40 bg-sky-50">
          <div className="flex items-center gap-3 p-3 border-b">
            <button
              className="lg:hidden px-3 py-2 rounded border text-gray-800"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open menu"
            >
              Menu
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {isEditing ? "Edit tour" : "Create a new tour"}
            </h1>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
            {uploadError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {uploadError}
              </div>
            )}

            {/* Basic info */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Basic information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Tour name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setField("name", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    placeholder="e.g., Golden Triangle Tour"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setField("category", e.target.value as typeof formData.category)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  >
                    <option value="group-tours">Group Tours</option>
                    <option value="tour-packages">Tour Packages</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Tour Location</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Starting Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(e) => setField("location", { ...formData.location, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    placeholder="Pickup point or main location"
                  />
                  {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location.city}
                      onChange={(e) => setField("location", { ...formData.location, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    />
                    {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location.state}
                      onChange={(e) => setField("location", { ...formData.location, state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    />
                    {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location.country}
                      onChange={(e) => setField("location", { ...formData.location, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    />
                    {errors.country && <p className="text-red-600 text-sm mt-1">{errors.country}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Postal code</label>
                    <input
                      type="text"
                      value={formData.location.postalCode}
                      onChange={(e) => setField("location", { ...formData.location, postalCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                >
                  <FaMapMarkerAlt /> Use current location
                </button>
              </div>
            </section>

            {/* Highlights */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Highlights & Facilities</h2>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Top highlights</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {HERO_HIGHLIGHTS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayValue("heroHighlights", item)}
                      className={`text-left px-3 py-2 rounded-lg border transition ${
                        formData.heroHighlights.includes(item)
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-300 text-gray-900 hover:border-green-400"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={customHighlight}
                    onChange={(e) => setCustomHighlight(e.target.value)}
                    placeholder="Add custom highlight"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={addCustomHighlight}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Popular facilities</h3>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_FACILITIES.map((facility) => (
                    <button
                      key={facility}
                      type="button"
                      onClick={() => toggleArrayValue("popularFacilities", facility)}
                      className={`px-3 py-2 rounded-full text-sm border transition ${
                        formData.popularFacilities.includes(facility)
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-300 text-gray-900 hover:border-green-400"
                      }`}
                    >
                      {facility}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Media */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Media</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Tour images <span className="text-red-500">*</span> (min 5)
                  </label>
                  <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 text-gray-900">
                    <FaUpload className="text-gray-600" />
                    <span>Choose files</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handlePropertyImages}
                    />
                  </label>
                  {uploadingState[`tours/${formData.category}/property`] && (
                    <p className="text-sm text-gray-600 mt-1">Uploading…</p>
                  )}
                  {errors.images && <p className="text-red-600 text-sm mt-1">{errors.images}</p>}
                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formData.images.map((src, i) => (
                        <div key={src + i} className="relative">
                          <img src={src} alt="" className="w-full h-32 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeMedia("images", i)}
                            className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Gallery (optional)</label>
                  <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 text-gray-900">
                    <FaUpload className="text-gray-600" />
                    <span>Add more images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleGalleryImages}
                    />
                  </label>
                  {formData.gallery.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formData.gallery.map((src, i) => (
                        <div key={src + i} className="relative">
                          <img src={src} alt="" className="w-full h-32 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeMedia("gallery", i)}
                            className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["inside", "outside"].map((key) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        {key === "inside" ? "Inside videos" : "Outside videos"}
                      </label>
                      <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 text-gray-900">
                        <FaUpload className="text-gray-600" />
                        <span>Select videos</span>
                        <input
                          type="file"
                          multiple
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => handleVideoUpload(e, key as "inside" | "outside")}
                        />
                      </label>
                      {formData.videos[key as "inside" | "outside"].length > 0 && (
                        <ul className="mt-2 space-y-2">
                          {formData.videos[key as "inside" | "outside"].map((url, i) => (
                            <li key={url + i} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                              <span className="truncate text-sm text-gray-900">Video {i + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeVideo(key as "inside" | "outside", i)}
                                className="text-red-600"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Amenities */}
            <section className="bg-white rounded-xl shadow p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Inclusions & Amenities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {AMENITY_SECTIONS.map((section) => (
                  <div key={section.key} className="space-y-2">
                    <h3 className="font-medium text-gray-900">{section.label}</h3>
                    <div className="flex flex-wrap gap-2">
                      {section.options.map((option) => {
                        const selected = (formData.amenities[section.key] || []).includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => toggleAmenity(section.key, option)}
                            className={`px-3 py-2 text-sm rounded-full border transition ${
                              selected
                                ? "border-green-500 bg-green-50 text-green-700"
                                : "border-gray-300 text-gray-900 hover:border-green-400"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Options */}
            <section className="bg-white rounded-xl shadow p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Tour Options</h2>
                <button
                  type="button"
                  onClick={addOption}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FaPlus /> Add option
                </button>
              </div>
              {errors.options && <p className="text-red-600 text-sm">{errors.options}</p>}

              <div className="space-y-6">
                {formData.options.map((option, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Option {index + 1}</h3>
                      {formData.options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Option name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e) => updateOption(index, "name", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                          placeholder="e.g., Half-Day City Tour"
                        />
                        {errors[`option-${index}-name`] && (
                          <p className="text-red-600 text-sm mt-1">{errors[`option-${index}-name`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Duration <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={option.duration}
                          onChange={(e) => updateOption(index, "duration", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        >
                          {DURATION_OPTIONS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        {errors[`option-${index}-duration`] && (
                          <p className="text-red-600 text-sm mt-1">{errors[`option-${index}-duration`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Capacity (guests) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={option.capacity}
                          onChange={(e) => updateOption(index, "capacity", Number(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        />
                        {errors[`option-${index}-capacity`] && (
                          <p className="text-red-600 text-sm mt-1">{errors[`option-${index}-capacity`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={option.price}
                          onChange={(e) => updateOption(index, "price", Number(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        />
                        {errors[`option-${index}-price`] && (
                          <p className="text-red-600 text-sm mt-1">{errors[`option-${index}-price`]}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={option.description}
                        onChange={(e) => updateOption(index, "description", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        placeholder="What guests will experience"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Features</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {["Private", "Group", "Family-friendly", "Photography", "Food included"].map((f) => {
                          const selected = option.features.includes(f);
                          return (
                            <button
                              key={f}
                              type="button"
                              onClick={() => {
                                if (selected) removeOptionFeature(index, f);
                                else updateOption(index, "features", [...option.features, f]);
                              }}
                              className={`px-3 py-2 text-sm rounded-full border transition ${
                                selected
                                  ? "border-green-500 bg-green-50 text-green-700"
                                  : "border-gray-300 text-gray-900 hover:border-green-400"
                              }`}
                            >
                              {f}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={optionFeatureDrafts[index] || ""}
                          onChange={(e) =>
                            setOptionFeatureDrafts((prev) => ({ ...prev, [index]: e.target.value }))
                          }
                          placeholder="Add custom feature"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => addOptionFeature(index)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Add
                        </button>
                      </div>
                      {option.features.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {option.features.map((f) => (
                            <span
                              key={f}
                              className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded-full text-gray-900"
                            >
                              {f}
                              <button
                                type="button"
                                onClick={() => removeOptionFeature(index, f)}
                                className="text-red-600"
                              >
                                <FaTimes />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Option images <span className="text-red-500">*</span> (min 3)
                      </label>
                      <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 text-gray-900">
                        <FaUpload className="text-gray-600" />
                        <span>Select images</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleOptionImages(e, index)}
                        />
                      </label>
                      {errors[`option-${index}-images`] && (
                        <p className="text-red-600 text-sm mt-1">{errors[`option-${index}-images`]}</p>
                      )}
                      {option.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                          {option.images.map((src, i) => (
                            <div key={src + i} className="relative">
                              <img src={src} alt="" className="w-full h-28 object-cover rounded-lg" />
                              <button
                                type="button"
                                onClick={() => removeOptionImage(index, i)}
                                className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* About & Policies */}
            <section className="bg-white rounded-xl shadow p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">About this tour</h2>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Heading <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.about.heading}
                      onChange={(e) => setField("about", { ...formData.about, heading: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    />
                    {errors.aboutHeading && <p className="text-red-600 text-sm mt-1">{errors.aboutHeading}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.about.description}
                      onChange={(e) => setField("about", { ...formData.about, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      placeholder="Describe the tour experience, itinerary, and highlights"
                    />
                    {errors.aboutDescription && (
                      <p className="text-red-600 text-sm mt-1">{errors.aboutDescription}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cancellation Policy</h3>
                <textarea
                  rows={3}
                  value={formData.defaultCancellationPolicy}
                  onChange={(e) => setField("defaultCancellationPolicy", e.target.value)}
                  className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  placeholder="e.g., Free cancellation up to 24 hours before tour"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">House Rules</h3>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Add a rule"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
                  />
                  <button
                    type="button"
                    onClick={addRule}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
                {formData.defaultHouseRules.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {formData.defaultHouseRules.map((rule, i) => (
                      <li key={rule + i} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg text-gray-900">
                        <span>{rule}</span>
                        <button
                          type="button"
                          onClick={() => removeRule(i)}
                          className="text-red-600"
                        >
                          <FaTimes />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Vendor message</label>
                <textarea
                  rows={4}
                  value={formData.vendorMessage}
                  onChange={(e) => setField("vendorMessage", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  placeholder="Any special note for guests"
                />
              </div>
            </section>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60"
              >
                {submitting
                  ? isEditing
                    ? "Updating…"
                    : "Creating…"
                  : isEditing
                  ? "Update Tour"
                  : "Create Tour"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/vendor/tours")}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>

      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 p-0 lg:hidden overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Menu</span>
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