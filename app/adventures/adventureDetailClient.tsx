// adventures/adventureDetailClient.tsx
"use client";

import { Fragment, useMemo, useState, type JSX } from "react";
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
  FaSpa,
  FaInfoCircle,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useWishlist } from "../hooks/useWishlist";
import { useAvailability } from "../hooks/useAvailability";

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
  mountain: <FaMountain />,
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

const formatDateDisplay = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const calculateDays = (start: string, end: string) => {
  if (!start || !end) return 1;
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b <= a) return 1;
  return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
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
  const { wishlistIds, isInWishlist, toggleWishlist, wishlistLoaded } = useWishlist({ autoLoad: true });
  const isWishlisted = isInWishlist(adventure._id);

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
  const [expandedOptionKey, setExpandedOptionKey] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [activeOptionIdx, setActiveOptionIdx] = useState<number | null>(null);
  const [optionImgIdx, setOptionImgIdx] = useState(0);

  const days = useMemo(() => calculateDays(startDate, endDate), [startDate, endDate]);

  const availability = useAvailability("adventure", adventure._id, startDate, endDate);
  const availableOptionKeys = availability.availableOptionKeys ?? [];
  const bookedSummaries = availability.bookedRanges.slice(0, 3);
  const soldOutForDates =
    !availability.loading && adventure.options.length > 0 && availableOptionKeys.length === 0;
  const isOptionUnavailable = (optionKey: string) => {
    if (availability.loading) return false;
    if (availableOptionKeys.length === 0) return soldOutForDates;
    return !availableOptionKeys.includes(optionKey);
  };

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

  const platformFee = pricing.totalOptions ? 15 : 0;
  const grandTotal = pricing.total + platformFee;

  const locationString = useMemo(
    () => [adventure.location.address, adventure.location.city, adventure.location.state, adventure.location.country].filter(Boolean).join(", "),
    [adventure.location.address, adventure.location.city, adventure.location.state, adventure.location.country]
  );

  const mapEmbedUrl = useMemo(
    () => `https://www.google.com/maps?q=${encodeURIComponent(locationString)}&output=embed`,
    [locationString]
  );

  const mapDirectionsUrl = useMemo(
    () => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationString)}`,
    [locationString]
  );

  const toggleSelection = (key: string, available: number) => {
    if (available <= 0 || isOptionUnavailable(key)) return;
    setOptionSelections((prev) => {
      const current = prev[key] || 0;
      if (available <= 0) {
        return { ...prev, [key]: 0 };
      }
      return { ...prev, [key]: current > 0 ? 0 : 1 };
    });
  };

  const stepQuantity = (key: string, delta: number, maxAvailable: number) => {
    if (isOptionUnavailable(key)) return;
    setOptionSelections((prev) => {
      const allowedMax = Math.max(0, maxAvailable);
      const current = prev[key] || 0;
      const next = Math.min(Math.max(current + delta, 0), allowedMax);
      return { ...prev, [key]: next };
    });
  };

  const handleBookNow = () => {
    if (!pricing.totalOptions || soldOutForDates) return;

    const params = new URLSearchParams({
      start: startDate,
      end: endDate,
      adults: String(adults),
      children: String(children),
      infants: String(infants),
    });

    pricing.selectedOptions.forEach(({ opt, qty }) => {
      const key = opt._id?.toString() || opt.name;
      params.append("options", `${key}:${qty}`);
    });

    router.push(`/adventures/${adventure._id}/book?${params.toString()}`);
  };

  const facilities = adventure.popularFacilities || [];
  const hasRating = adventure.rating && adventure.rating.count;

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      <header className="relative isolate overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 pb-20 pt-16 text-white">
        {/* <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: adventure.images?.length
              ? `url(${adventure.images[0]})`
              : "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        /> */}
        <div className="relative mx-auto max-w-6xl px-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white backdrop-blur transition hover:bg-white/25"
          >
            <FaArrowLeft /> Back to adventures
          </button>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
            <div className="max-w-3xl">
              <div className="flex items-start justify-between gap-6">
                <div className="max-w-xl">
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
                    {locationString}
                  </p>
                </div>
                <a
                  href={mapDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25 md:flex md:items-center md:gap-2"
                >
                  View on map
                </a>
              </div>

              {adventure.tags && adventure.tags.length > 0 && (
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
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {adventure.heroHighlights.slice(0, 3).map((h) => (
                    <div
                      key={h}
                      className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-medium text-white shadow-sm backdrop-blur"
                    >
                      {h}
                    </div>
                  ))}
                </div>
              )}
            </div>

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
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  soldOutForDates
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {availability.loading && "Checking availability…"}
                {!availability.loading && !availability.error && (
                  <span>
                    {soldOutForDates
                      ? "These dates are sold out. Please select another range."
                      : "These dates are available."}
                  </span>
                )}
                {availability.error && (
                  <span className="text-rose-600">Unable to check availability. Please refresh.</span>
                )}
                {!availability.loading && bookedSummaries.length > 0 && (
                  <p className="mt-2 text-xs text-gray-600">
                    Upcoming booked dates:{" "}
                    {bookedSummaries
                      .map((range) => `${formatDateDisplay(range.start)} – ${formatDateDisplay(range.end)}`)
                      .join(", ")}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  const target = document.getElementById("adventure-availability");
                  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="mt-4 w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-orange-700"
              >
                View available options
              </button>
              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 text-sm font-medium text-orange-50 hover:text-white"
              >
                <FaMapMarkerAlt /> Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-12 max-w-6xl px-6 pb-16">
        <section className="grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Adventure location</h2>
              <p className="mt-2 text-sm text-gray-600">
                Get inspired by the terrain and surroundings. Check the trailhead or meetup point in advance.
              </p>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-orange-600" />
                <span>{adventure.location.city}, {adventure.location.state}</span>
              </div>
              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
              >
                <FaMapMarkerAlt /> Open in Google Maps
              </a>
            </div>
          </div>
          <div className="h-72 w-full overflow-hidden rounded-2xl border border-gray-100 shadow-inner">
            <iframe
              src={mapEmbedUrl}
              title={`${adventure.name} map`}
              loading="lazy"
              className="h-full w-full"
              allowFullScreen
            />
          </div>
        </section>

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
            {images.length <= 1 && (
              <div className="flex h-32 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                More images coming soon
              </div>
            )}
          </div>
        </section>

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

        {adventure.curatedHighlights && adventure.curatedHighlights.length > 0 && (
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

        <section id="adventure-availability" className="space-y-5 rounded-3xl bg-white p-6 shadow">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Availability</h2>
              <p className="text-sm text-gray-600">
                Choose the experiences you’d like to join for {days} day{days === 1 ? "" : "s"}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-orange-700">
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1">
                <FaCheck /> Expert guides
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1">
                <FaInfoCircle /> Safety briefings included
              </span>
            </div>
          </div>

          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              soldOutForDates
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {availability.loading && "Checking availability…"}
            {!availability.loading && !availability.error && (
              <span>
                {soldOutForDates ? "Sold out for these dates." : "Available for these dates."}
              </span>
            )}
            {availability.error && (
              <span className="text-rose-600">Unable to load availability. Please try again.</span>
            )}
            {!availability.loading && bookedSummaries.length > 0 && (
              <span className="mt-1 block text-xs text-gray-600">
                Booked:{" "}
                {bookedSummaries
                  .map((range) => `${formatDateDisplay(range.start)} – ${formatDateDisplay(range.end)}`)
                  .join(", ")}
              </span>
            )}
          </div>

          <div className={`overflow-x-auto rounded-2xl border border-gray-200 ${soldOutForDates ? "pointer-events-none opacity-60" : ""}`}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Adventure</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Price / day</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {adventure.options.map((opt, idx) => {
                  const key = opt._id?.toString() || opt.name;
                  const qty = optionSelections[key] || 0;
                  const isSelected = qty > 0;
                  const isExpanded = expandedOptionKey === key;
                  const available = opt.available ?? 0;
                  const taxesNote = opt.taxes ? `Taxes ₹${opt.taxes.toLocaleString()} extra` : "Taxes included";
                  const optionUnavailable = available <= 0 || isOptionUnavailable(key);

                  return (
                    <Fragment key={key}>
                      <tr className={isSelected ? "bg-orange-50/60 transition" : "transition hover:bg-gray-50/60"}>
                        <td className="align-top px-4 py-4 text-sm text-gray-700">
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-base font-semibold text-gray-900">{opt.name}</span>
                              {isSelected && (
                                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                                  Selected
                                </span>
                              )}
                              {optionUnavailable && (
                                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                                  Sold out
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              <FaClock className="mr-1 inline text-orange-500" />
                              {opt.duration} · Difficulty: {opt.difficulty}
                            </p>
                            {opt.description && (
                              <p className="text-sm text-gray-600">{opt.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="align-top px-4 py-4 text-sm text-gray-700">
                          <div className="flex flex-col gap-2">
                            {opt.features?.length ? (
                              <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                                {opt.features.slice(0, 3).map((feature) => (
                                  <span key={feature} className="rounded-full bg-gray-100 px-2 py-0.5">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Highlights coming soon</span>
                            )}
                            {opt.amenities?.length ? (
                              <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                                {opt.amenities.slice(0, 3).map((amenity) => (
                                  <span key={amenity} className="rounded-full bg-gray-100 px-2 py-0.5">
                                    {amenity}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="align-top px-4 py-4 text-sm text-gray-700">
                          <div className="flex flex-col">
                            <span className="text-lg font-semibold text-gray-900">₹{opt.price.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">{taxesNote}</span>
                          </div>
                        </td>
                        <td className="align-top px-4 py-4">
                          <div className="flex flex-col items-stretch gap-3 text-sm sm:flex-row sm:items-center sm:justify-end">
                            <button
                              type="button"
                              onClick={() => setExpandedOptionKey(isExpanded ? null : key)}
                              className="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-2 font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                            >
                              {isExpanded ? "Hide details" : "Show details"}
                            </button>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => stepQuantity(key, -1, available)}
                                disabled={qty <= 0 || optionUnavailable}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-lg font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                –
                              </button>
                              <span className="min-w-[2ch] text-center text-sm font-semibold text-gray-900">{qty}</span>
                              <button
                                type="button"
                                onClick={() => stepQuantity(key, 1, available)}
                                disabled={available <= 0 || qty >= available || optionUnavailable}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-lg font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                              <button
                              type="button"
                              onClick={() => toggleSelection(key, available)}
                                disabled={optionUnavailable}
                              className={`inline-flex items-center justify-center rounded-full px-4 py-2 font-semibold transition ${
                                isSelected
                                  ? "bg-orange-600 text-white shadow hover:bg-orange-700"
                                  : "border border-orange-600 text-orange-700 hover:bg-orange-50 disabled:border-gray-300 disabled:text-gray-400"
                                } ${
                                  optionUnavailable
                                    ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400"
                                    : ""
                                }`}
                            >
                              {optionUnavailable ? "Unavailable" : isSelected ? "Selected" : "Select"}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={4} className="bg-gray-50 px-4 py-6">
                            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
                              <div className="space-y-4">
                                <div className="grid gap-3 sm:grid-cols-3">
                                  {opt.images?.slice(0, 3).map((src, i) => (
                                    <div key={src + i} className="relative h-28 overflow-hidden rounded-xl">
                                      <Image src={src} alt={`${opt.name} photo ${i + 1}`} fill className="object-cover" />
                                    </div>
                                  ))}
                                  {opt.images && opt.images.length > 3 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveOptionIdx(idx);
                                        setOptionImgIdx(0);
                                      }}
                                      className="flex h-28 items-center justify-center rounded-xl border border-dashed border-gray-300 text-xs font-semibold text-gray-600 transition hover:border-gray-400 hover:text-gray-800"
                                    >
                                      View {opt.images.length - 3} more photos
                                    </button>
                                  )}
                                </div>
                                {opt.description && (
                                  <p className="text-sm leading-relaxed text-gray-700">{opt.description}</p>
                                )}
                              </div>

                              <div className="space-y-4 text-sm text-gray-700">
                                {opt.amenities?.length ? (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Inclusions</p>
                                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                      {opt.amenities.slice(0, 8).map((amenity) => (
                                        <span key={amenity} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
                                          <span className="text-orange-600">{getFacilityIcon(amenity)}</span>
                                          <span>{amenity}</span>
                                        </span>
                                      ))}
                                    </div>
                                    {opt.amenities.length > 8 && (
                                      <p className="mt-2 text-xs text-gray-500">
                                        +{opt.amenities.length - 8} more inclusions
                                      </p>
                                    )}
                                  </div>
                                ) : null}

                                {opt.features?.length ? (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Highlights</p>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                                      {opt.features.map((feature) => (
                                        <span key={feature} className="rounded-full bg-gray-100 px-3 py-1">
                                          {feature}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
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
                {pricing.totalOptions > 0 && (
                  <div className="flex justify-between">
                    <span>Platform fee</span>
                    <span>₹{platformFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
            {!pricing.totalOptions && (
              <p className="text-xs text-amber-600">
                Select at least one option above to continue.
              </p>
            )}
            {soldOutForDates && (
              <p className="text-xs text-rose-600">
                These dates are sold out. Choose different dates to continue.
              </p>
            )}
            <button
              type="button"
              onClick={handleBookNow}
              disabled={!pricing.totalOptions || soldOutForDates}
              className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {soldOutForDates
                ? "Unavailable for these dates"
                : pricing.totalOptions
                ? "Book now"
                : "Select an option to book"}
            </button>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-orange-50 via-white to-orange-100 p-5 text-sm text-gray-700 shadow-inner">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">What happens next?</h3>
              <p>Clicking <strong>Book now</strong> will take you to a dedicated page where you can:</p>
              <ul className="ml-4 list-disc space-y-2 text-sm">
                <li>Review your adventure summary and price breakdown</li>
                <li>Provide traveller and emergency contact details</li>
                <li>Add special requests before submitting the reservation</li>
              </ul>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              We hold your selection for a short time. Complete the form on the next page to confirm your booking.
            </p>
          </div>
        </section>

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

        {(adventure.videos?.inside?.length || adventure.videos?.outside?.length) && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Videos</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {(["inside", "outside"] as const).map((k) => (
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