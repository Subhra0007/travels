// adventures/adventureDetailClient.tsx
"use client";

import { useMemo, useState, type JSX } from "react";
import Image from "next/image";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaMapMarkerAlt,
  FaTag,
  FaUsers,
  FaVideo,
  FaStar,
  FaClock,
  FaMountain,
  FaShieldAlt,
  FaSwimmer,
  FaUtensils,
  FaCoffee,
  FaDumbbell,
  FaConciergeBell,
  FaChild,
  FaWheelchair,
  FaAccessibleIcon,
  FaBath,
  FaShower,
  FaTv,
  FaSnowflake,
  FaHotjar,
  FaWifi,
  FaParking,
  FaGlassCheers,
  FaSpa
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useWishlist } from "../hooks/useWishlist";

export type AdventureDetailPayload = {
  _id: string;
  name: string;
  vendorId: string;
  category: "trekking" | "hiking" | "camping" | "water-rafting";
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  heroHighlights: string[];
  curatedHighlights?: Array<{ title: string; description?: string; icon?: string }>;
  tags?: string[];
  rating?: { average: number; count: number };
  images: string[];
  gallery: string[];
  videos: { inside?: string[]; outside?: string[] };
  popularFacilities: string[];
  amenities: Record<string, string[]>;
  options: Array<{
    _id?: string;
    name: string;
    description?: string;
    duration: string;
    difficulty: string;
    capacity: number;
    price: number;
    taxes?: number;
    currency?: string;
    features: string[];
    amenities: string[];
    available: number;
    images: string[];
    isRefundable?: boolean;
    refundableUntilHours?: number;
  }>;
  defaultCancellationPolicy?: string;
  defaultHouseRules?: string[];
  about: { heading: string; description: string };
  vendorMessage?: string;
};

const facilityIconMap: Record<string, JSX.Element> = {
  pool: <FaSwimmer />,
  swim: <FaSwimmer />,
  swimming: <FaSwimmer />,
  wifi: <FaWifi />,
  internet: <FaWifi />,
  parking: <FaParking />,
  spa: <FaSpa />,
  restaurant: <FaUtensils />,
  bar: <FaGlassCheers />,
  lounge: <FaGlassCheers />,
  breakfast: <FaCoffee />,
  gym: <FaDumbbell />,
  fitness: <FaDumbbell />,
  concierge: <FaConciergeBell />,
  family: <FaChild />,
  security: <FaShieldAlt />,
  safety: <FaShieldAlt />,
  wheelchair: <FaWheelchair />,
  accessible: <FaAccessibleIcon />,
  bathroom: <FaBath />,
  shower: <FaShower />,
  tv: <FaTv />,
  air: <FaSnowflake />,
  conditioning: <FaSnowflake />,
};

const getFacilityIcon = (label: string) => {
  const key = label.toLowerCase();
  const match = Object.entries(facilityIconMap).find(([term]) => key.includes(term));
  return match ? match[1] : <FaCheck />;
};

const formatDateInput = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getDefaultDates = () => {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  return { start: formatDateInput(today), end: formatDateInput(tomorrow) };
};

interface AdventureDetailClientProps {
  adventure: AdventureDetailPayload;
}

const AdventureDetailClient: React.FC<AdventureDetailClientProps> = ({ adventure }) => {
  const router = useRouter();
  const { wishlistIds, toggleWishlist, wishlistLoaded } = useWishlist({ autoLoad: true });
  const isWishlisted = wishlistIds.has(adventure._id);

  const images = useMemo(() => {
    const gallery = Array.isArray(adventure.gallery) ? adventure.gallery : [];
    return [...adventure.images, ...gallery].filter(Boolean);
  }, [adventure.images, adventure.gallery]);

  const { start: defaultStart, end: defaultEnd } = useMemo(() => getDefaultDates(), []);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const initialSelections = useMemo(() => {
    const map: Record<string, number> = {};
    adventure.options.forEach((opt) => {
      const key = opt._id?.toString() || opt.name;
      map[key] = 0;
    });
    return map;
  }, [adventure.options]);

  const [optionSelections, setOptionSelections] = useState<Record<string, number>>(initialSelections);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const [guestDetails, setGuestDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [activeOptionIdx, setActiveOptionIdx] = useState<number | null>(null);
  const [optionImgIdx, setOptionImgIdx] = useState(0);

  const days = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const a = new Date(startDate);
    const b = new Date(endDate);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b <= a) return 1;
    return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  const pricing = useMemo(() => {
    let subtotal = 0;
    let taxes = 0;
    const selected = adventure.options.map((opt) => {
      const key = opt._id?.toString() || opt.name;
      const qty = optionSelections[key] || 0;
      if (!qty) return null;
      const price = opt.price;
      const tax = opt.taxes ?? 0;
      subtotal += price * qty * days;
      taxes += tax * qty * days;
      return { opt, qty, price, tax };
    });
    const totalOptions = selected.filter(Boolean).reduce((s, i) => s + (i?.qty ?? 0), 0);
    const total = subtotal + taxes;
    return {
      subtotal,
      taxes,
      total,
      totalOptions,
      selectedOptions: selected.filter(Boolean) as Array<{
        opt: AdventureDetailPayload["options"][number];
        qty: number;
        price: number;
        tax: number;
      }>,
    };
  }, [optionSelections, adventure.options, days]);

  const handleQty = (key: string, qty: number) => {
    setOptionSelections((prev) => ({ ...prev, [key]: qty }));
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    if (!pricing.totalOptions) return setBookingError("Select at least one option");
    if (!guestDetails.fullName || !guestDetails.email) return setBookingError("Name & email required");

    setBookingLoading(true);
    try {
      const payload = {
        adventureId: adventure._id,
        startDate,
        endDate,
        guests: { adults, children, infants },
        customer: guestDetails,
        currency: pricing.selectedOptions[0]?.opt.currency || "INR",
        options: pricing.selectedOptions.map(({ opt, qty, price, tax }) => ({
          optionId: opt._id,
          optionName: opt.name,
          quantity: qty,
          price,
          taxes: tax,
        })),
        fees: 0,
      };

      const res = await fetch("/api/bookings/adventures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || "Booking failed");
      setBookingSuccess(data.booking);
      setShowBookingForm(false);
    } catch (err: any) {
      setBookingError(err?.message || "Booking error");
    } finally {
      setBookingLoading(false);
    }
  };

  const facilities = adventure.popularFacilities || [];
  const hasRating = adventure.rating && adventure.rating.count;

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      {/* Header */}
      <header className="relative isolate overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 pb-16 pt-20 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: adventure.images?.length
              ? `url(${adventure.images[0]})`
              : "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6">
          <button
            onClick={() => router.back()}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white backdrop-blur transition hover:bg-white/25"
          >
            <FaArrowLeft /> Back
          </button>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="uppercase tracking-wide text-white/80">{adventure.category}</p>
              <div className="mt-2 flex items-center gap-3">
                <h1 className="text-3xl font-bold leading-snug sm:text-4xl md:text-5xl">{adventure.name}</h1>
                <button
                  type="button"
                  onClick={() => toggleWishlist(adventure._id, !isWishlisted, "adventure")}
                  disabled={!wishlistLoaded}
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25 ${
                    !wishlistLoaded ? "cursor-not-allowed opacity-60" : ""
                  }`}
                >
                  <FaHeart className={isWishlisted ? "text-red-400" : "text-white"} />
                </button>
              </div>
              <p className="mt-3 flex items-center text-base text-white/90">
                <FaMapMarkerAlt className="mr-2" />
                {adventure.location.address}, {adventure.location.city}
              </p>
              {adventure.tags && adventure.tags.length> 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {adventure.tags.slice(0, 4).map((t) => (
                    <span key={t} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                      <FaTag /> {t}
                    </span>
                  ))}
                </div>
              )}
              {hasRating && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white">
                  <FaStar className="text-yellow-300" /> {adventure.rating!.average.toFixed(1)} · {adventure.rating!.count} reviews
                </div>
              )}
              {adventure.heroHighlights?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {adventure.heroHighlights.slice(0, 4).map((h) => (
                    <span
                      key={h}
                      className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white shadow"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Trip Planner */}
            <div className="w-full max-w-xl rounded-2xl bg-white/95 p-6 text-gray-900 shadow-lg backdrop-blur">
              <h2 className="text-lg font-semibold text-gray-900">Plan your adventure</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  Start
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      const v = e.target.value;
                      setStartDate(v);
                      if (new Date(v) >= new Date(endDate)) {
                        const next = new Date(v);
                        next.setDate(next.getDate() + 1);
                        setEndDate(formatDateInput(next));
                      }
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-orange-500 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  End
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-orange-500 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  Adults
                  <input
                    type="number"
                    min={1}
                    value={adults}
                    onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-orange-500 focus:outline-none"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <label className="flex flex-col gap-1">
                    Children
                    <input
                      type="number"
                      min={0}
                      value={children}
                      onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                      className="rounded-lg border border-gray-200 px-3 py-2 focus:border-orange-500 focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    Infants
                    <input
                      type="number"
                      min={0}
                      value={infants}
                      onChange={(e) => setInfants(Math.max(0, Number(e.target.value)))}
                      className="rounded-lg border border-gray-200 px-3 py-2 focus:border-orange-500 focus:outline-none"
                    />
                  </label>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">Days: {days}</p>
              <button
                onClick={() => setShowBookingForm(true)}
                className="mt-4 w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-orange-700"
              >
                Start booking
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto -mt-12 flex max-w-6xl flex-col gap-12 px-6 pb-16">
        {/* Gallery */}
        <section className="grid gap-4 rounded-3xl bg-white p-6 shadow-xl md:grid-cols-5">
          <div className="relative h-64 w-full overflow-hidden rounded-2xl md:col-span-3">
            {images.length ? (
              <Image src={images[galleryIndex]} alt={adventure.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-100 text-gray-500">No photos</div>
            )}
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow"
              >
                View all
              </button>
            )}
          </div>
          <div className="grid gap-4 md:col-span-2">
            {images.slice(1, 4).map((src, i) => (
              <div key={src + i} className="relative h-32 overflow-hidden rounded-2xl">
                <Image src={src} alt={`photo ${i + 2}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </section>

        {/* Popular Facilities */}
        {facilities.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Popular facilities</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {facilities.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1 text-sm font-medium text-orange-700"
                >
                  <span className="text-base leading-none">{getFacilityIcon(f)}</span>
                  {f}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Curated Highlights */}
        {adventure.curatedHighlights && adventure.curatedHighlights.length> 0 && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Why guests love it</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {adventure.curatedHighlights.map((item, i) => (
                <div
                  key={item.title + i}
                  className="flex gap-3 rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-800"
                >
                  <div className="mt-1 text-lg text-orange-600">{item.icon ? <i className={item.icon} /> : <FaCheck />}</div>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    {item.description && <p className="mt-1 text-orange-700/90">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* About + Rules */}
        <section className="grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">About this adventure</h2>
            <h3 className="mt-2 text-lg font-semibold text-gray-800">{adventure.about.heading}</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {adventure.about.description}
            </p>
            {adventure.vendorMessage && (
              <div className="mt-4 rounded-2xl bg-orange-50 p-4 text-sm text-orange-800">
                <p className="font-semibold">Vendor message</p>
                <p className="mt-2 whitespace-pre-line">{adventure.vendorMessage}</p>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Rules</h2>
            <div className="mt-3 space-y-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              {adventure.defaultHouseRules && adventure.defaultHouseRules.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {adventure.defaultHouseRules.map((r, i) => (
                    <li key={r + i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
            {adventure.defaultCancellationPolicy && (
              <div className="mt-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Cancellation policy</p>
                <p className="mt-2 whitespace-pre-line">{adventure.defaultCancellationPolicy}</p>
              </div>
            )}
          </div>
        </section>

        {/* Options */}
        <section className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Adventure options</h2>
            <p className="text-sm text-gray-600">
              Choose from {adventure.options.length} option{adventure.options.length === 1 ? "" : "s"}.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {adventure.options.map((opt, idx) => {
              const key = opt._id?.toString() || opt.name;
              const qty = optionSelections[key] || 0;
              return (
                <div key={key} className="flex flex-col rounded-3xl bg-white p-5 shadow">
                  <div className="relative h-48 w-full overflow-hidden rounded-2xl">
                    {opt.images?.length ? (
                      <Image src={opt.images[0]} alt={opt.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-100 text-gray-500">
                        No image
                      </div>
                    )}
                    {opt.images?.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveOptionIdx(idx);
                          setOptionImgIdx(0);
                        }}
                        className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow"
                      >
                        Gallery
                      </button>
                    )}
                  </div>
                  <div className="mt-4 space-y-3 text-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{opt.name}</h3>
                        <p className="text-xs text-gray-500">
                          <FaClock className="inline mr-1" />
                          {opt.duration} • {opt.difficulty}
                        </p>
                      </div>
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                        ₹{opt.price.toLocaleString()}
                      </span>
                    </div>
                    {opt.description && (
                      <p className="text-sm leading-relaxed text-gray-700">{opt.description}</p>
                    )}
                    {opt.features?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                          Highlights
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                          {opt.features.slice(0, 6).map((f) => (
                            <span key={f} className="rounded-full bg-gray-100 px-3 py-1">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <label className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm">
                      <span className="text-gray-700">Book</span>
                      <select
                        value={qty}
                        onChange={(e) => handleQty(key, Number(e.target.value))}
                        className="rounded-lg border border-gray-200 px-3 py-1 focus:border-orange-500 focus:outline-none"
                      >
                        {Array.from(
                          { length: Math.min(6, Math.max(0, opt.available ?? 0)) + 1 },
                          (_, i) => i
                        ).map((i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="text-xs text-gray-500">
                      {opt.isRefundable
                        ? `Free cancellation up to ${opt.refundableUntilHours ?? 48}h`
                        : "Non-refundable"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Booking Summary */}
        <section className="grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Booking summary</h2>
            <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <FaCalendarAlt /> {days} day{days === 1 ? "" : "s"}
              </p>
              <p className="mt-2 flex items-center gap-2">
                <FaUsers /> {adults} adult{adults === 1 ? "" : "s"}
                {children > 0 && ` · ${children} child${children === 1 ? "" : "ren"}`}
                {infants > 0 && ` · ${infants} infant${infants === 1 ? "" : "s"}`}
              </p>
              <p className="mt-2 text-gray-600">Options: {pricing.totalOptions}</p>
              <div className="mt-4 space-y-2 border-t border-gray-200 pt-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{pricing.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & fees</span>
                  <span>₹{pricing.taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₹{pricing.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            {!pricing.totalOptions && (
              <p className="text-xs text-amber-600">
                Select at least one option to continue.
              </p>
            )}
            {!bookingSuccess && (
              <button
                type="button"
                onClick={() => setShowBookingForm(true)}
                disabled={!pricing.totalOptions}
                className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-orange-700 disabled:opacity-60"
              >
                {showBookingForm ? "Update details" : "Continue"}
              </button>
            )}
            {bookingSuccess && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <p className="font-semibold">Booking confirmed!</p>
                <p className="mt-2">Ref: {bookingSuccess._id}</p>
              </div>
            )}
          </div>

          {showBookingForm && !bookingSuccess && (
            <form onSubmit={handleBooking} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-700">
              <h3 className="text-lg font-semibold text-gray-900">Guest details</h3>
              <label className="flex flex-col gap-1">
                Full name <span className="text-red-600">*</span>
                <input
                  required
                  value={guestDetails.fullName}
                  onChange={(e) => setGuestDetails((p) => ({ ...p, fullName: e.target.value }))}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-orange-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                Email <span className="text-red-600">*</span>
                <input
                  type="email"
                  required
                  value={guestDetails.email}
                  onChange={(e) => setGuestDetails((p) => ({ ...p, email: e.target.value }))}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-orange-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                Phone (optional)
                <input
                  type="tel"
                  value={guestDetails.phone}
                  onChange={(e) => setGuestDetails((p) => ({ ...p, phone: e.target.value }))}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-orange-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                Special requests
                <textarea
                  rows={3}
                  value={guestDetails.notes}
                  onChange={(e) => setGuestDetails((p) => ({ ...p, notes: e.target.value }))}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-orange-500 focus:outline-none"
                />
              </label>
              {bookingError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-600">
                  {bookingError}
                </div>
              )}
              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-orange-700 disabled:opacity-60"
              >
                {bookingLoading ? "Processing…" : "Complete booking"}
              </button>
            </form>
          )}
        </section>

        {/* Amenities */}
        {adventure.amenities && Object.keys(adventure.amenities).length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {Object.entries(adventure.amenities).map(([cat, items]) => (
                <div key={cat}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{cat}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {items.map((it, i) => (
                      <li key={it + i} className="flex items-start gap-3">
                        <span className="mt-0.5 text-orange-600">{getFacilityIcon(it)}</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Videos */}
        {(adventure.videos?.inside?.length || adventure.videos?.outside?.length) && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Videos</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {["inside", "outside"].map((k) => (
                <div key={k} className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
                    <FaVideo /> {k === "inside" ? "Inside" : "Outside"} walk-through
                  </h3>
                  {(adventure.videos as any)?.[k]?.length ? (
                    (adventure.videos as any)[k].map((url: string, i: number) => (
                      <video key={url + i} controls className="h-48 w-full rounded-2xl bg-black">
                        <source src={url} />
                      </video>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Coming soon</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Gallery Modal */}
      {galleryOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <button
            type="button"
            onClick={() => setGalleryOpen(false)}
            className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-sm text-white shadow"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => setGalleryIndex((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/30 p-3 text-white"
          >
            <FaChevronLeft />
          </button>
          <div className="relative h-[70vh] w-full max-w-4xl overflow-hidden rounded-2xl">
            <Image src={images[galleryIndex]} alt={`photo ${galleryIndex + 1}`} fill className="object-contain" />
          </div>
          <button
            type="button"
            onClick={() => setGalleryIndex((i) => (i + 1) % images.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/30 p-3 text-white"
          >
            <FaChevronRight />
          </button>
        </div>
      )}

      {/* Option Gallery Modal */}
      {activeOptionIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <button
            type="button"
            onClick={() => setActiveOptionIdx(null)}
            className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-sm text-white shadow"
          >
            Close
          </button>
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">{adventure.options[activeOptionIdx].name}</h3>
            <div className="relative mt-4 h-72 overflow-hidden rounded-2xl">
              <Image
                src={adventure.options[activeOptionIdx].images[optionImgIdx]}
                alt="option image"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setOptionImgIdx(
                    (i) =>
                      (i - 1 + adventure.options[activeOptionIdx].images.length) %
                      adventure.options[activeOptionIdx].images.length
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
              >
                <FaChevronLeft />
              </button>
              <button
                type="button"
                onClick={() =>
                  setOptionImgIdx(
                    (i) => (i + 1) % adventure.options[activeOptionIdx].images.length
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
              >
                <FaChevronRight />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {adventure.options[activeOptionIdx].images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setOptionImgIdx(i)}
                  className={`relative h-20 overflow-hidden rounded-lg ${optionImgIdx === i ? "ring-2 ring-orange-500" : ""}`}
                >
                  <Image src={src} alt="thumb" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdventureDetailClient;