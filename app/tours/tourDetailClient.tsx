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
  FaWifi,
  FaParking,
  FaSpa,
  FaUtensils,
  FaGlassCheers,
  FaCoffee,
  FaDumbbell,
  FaConciergeBell,
  FaChild,
  FaShieldAlt,
  FaWheelchair,
  FaAccessibleIcon,
  FaBath,
  FaShower,
  FaTv,
  FaSnowflake,
  FaHotjar,
  FaSwimmer,
  FaStar,
  FaInfoCircle,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useWishlist } from "../hooks/useWishlist";

export type TourDetailPayload = {
  _id: string;
  name: string;
  vendorId: string;
  category: "group-tours" | "tour-packages";
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  heroHighlights: string[];
  curatedHighlights?: Array<{ title: string; description?: string; icon?: string }>;
  tags?: string[];
  rating?: {
    average: number;
    count: number;
  };
  images: string[];
  gallery: string[];
  videos: {
    inside?: string[];
    outside?: string[];
  };
  popularFacilities: string[];
  amenities: Record<string, string[]>;
  options: Array<{
    _id?: string;
    name: string;
    description?: string;
    duration: string;
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
  about: {
    heading: string;
    description: string;
  };
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
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calculateDays = (start: string, end: string) => {
  if (!start || !end) return 1;
  const inDate = new Date(start);
  const outDate = new Date(end);
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime()) || outDate <= inDate) return 1;
  return Math.max(1, Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));
};

const getDefaultDates = () => {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  return {
    start: formatDateInput(today),
    end: formatDateInput(tomorrow),
  };
};

interface TourDetailClientProps {
  tour: TourDetailPayload;
}

const TourDetailClient: React.FC<TourDetailClientProps> = ({ tour }) => {
  const router = useRouter();
  const { wishlistIds, toggleWishlist, wishlistLoaded } = useWishlist({ autoLoad: true });
  const isWishlisted = wishlistIds.has(tour._id);

  const images = useMemo(() => {
    const galleryImages = Array.isArray(tour.gallery) ? tour.gallery : [];
    return [...tour.images, ...galleryImages].filter(Boolean);
  }, [tour.images, tour.gallery]);

  const { start: defaultStart, end: defaultEnd } = useMemo(() => getDefaultDates(), []);

  const [startDate, setStartDate] = useState<string>(defaultStart);
  const [endDate, setEndDate] = useState<string>(defaultEnd);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);

  const initialSelections = useMemo(() => {
    const entries: Record<string, number> = {};
    tour.options.forEach((option) => {
      const optionKey = option._id?.toString() || option.name;
      entries[optionKey] = 0;
    });
    return entries;
  }, [tour.options]);

  const [optionSelections, setOptionSelections] = useState<Record<string, number>>(initialSelections);
  const [expandedOptionKey, setExpandedOptionKey] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [activeOptionIndex, setActiveOptionIndex] = useState<number | null>(null);
  const [optionImageIndex, setOptionImageIndex] = useState(0);

  const days = useMemo(() => calculateDays(startDate, endDate), [startDate, endDate]);

  const pricing = useMemo(() => {
    let subtotal = 0;
    let taxes = 0;
    const selectedOptions = tour.options.map((option) => {
      const optionKey = option._id?.toString() || option.name;
      const quantity = optionSelections[optionKey] || 0;
      if (!quantity) return null;
      const price = option.price;
      const optionTaxes = option.taxes ?? 0;
      subtotal += price * quantity * days;
      taxes += optionTaxes * quantity * days;
      return { option, quantity, price, optionTaxes };
    });
    const totalOptions = selectedOptions.filter(Boolean).reduce((acc, item) => acc + (item?.quantity || 0), 0);
    const total = subtotal + taxes;
    return {
      subtotal,
      taxes,
      total,
      totalOptions,
      selectedOptions: selectedOptions.filter(Boolean) as Array<{
        option: TourDetailPayload["options"][number];
        quantity: number;
        price: number;
        optionTaxes: number;
      }>,
    };
  }, [optionSelections, tour.options, days]);

  const platformFee = pricing.totalOptions ? 15 : 0;
  const grandTotal = pricing.total + platformFee;

  const locationString = useMemo(
    () => [tour.location.address, tour.location.city, tour.location.state, tour.location.country].filter(Boolean).join(", "),
    [tour.location.address, tour.location.city, tour.location.state, tour.location.country]
  );

  const mapEmbedUrl = useMemo(
    () => `https://www.google.com/maps?q=${encodeURIComponent(locationString)}&output=embed`,
    [locationString]
  );

  const mapDirectionsUrl = useMemo(
    () => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationString)}`,
    [locationString]
  );

  const toggleOptionSelection = (optionKey: string, available: number) => {
    setOptionSelections((prev) => {
      const current = prev[optionKey] || 0;
      if (available <= 0) {
        return { ...prev, [optionKey]: 0 };
      }
      return { ...prev, [optionKey]: current > 0 ? 0 : 1 };
    });
  };

  const stepOptionQuantity = (optionKey: string, delta: number, maxAvailable: number) => {
    setOptionSelections((prev) => {
      const allowedMax = Math.max(0, maxAvailable);
      const current = prev[optionKey] || 0;
      const next = Math.min(Math.max(current + delta, 0), allowedMax);
      return { ...prev, [optionKey]: next };
    });
  };

  const handleBookNow = () => {
    if (!pricing.totalOptions) return;

    const params = new URLSearchParams({
      start: startDate,
      end: endDate,
      adults: String(adults),
      children: String(children),
      infants: String(infants),
    });

    pricing.selectedOptions.forEach(({ option, quantity }) => {
      const optionKey = option._id?.toString() || option.name;
      params.append("options", `${optionKey}:${quantity}`);
    });

    router.push(`/tours/${tour._id}/book?${params.toString()}`);
  };

  const tourFacilities = tour.popularFacilities || [];
  const hasRating = !!tour.rating?.count;

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      <header className="relative isolate overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-500 to-sky-400 pb-20 pt-16 text-white">
     
        <div className="relative mx-auto max-w-6xl px-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white backdrop-blur transition hover:bg-white/25"
          >
            <FaArrowLeft /> Back to tours
          </button>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
            <div className="max-w-3xl">
              <div className="flex items-start justify-between gap-6">
                <div className="max-w-xl">
                  <p className="uppercase tracking-wide text-white/80">{tour.category}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <h1 className="text-3xl font-bold leading-snug sm:text-4xl md:text-5xl">{tour.name}</h1>
                    <button
                      type="button"
                      aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                      onClick={() => toggleWishlist(tour._id, !isWishlisted, "tour")}
                      disabled={!wishlistLoaded}
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 ${
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

              {tour.tags && tour.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tour.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                      <FaTag /> {tag}
                    </span>
                  ))}
                </div>
              )}

              {hasRating && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white">
                  <FaStar className="text-yellow-300" /> {tour.rating!.average.toFixed(1)} · {tour.rating!.count} reviews
                </div>
              )}

              {tour.heroHighlights?.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tour.heroHighlights.slice(0, 3).map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-medium text-white shadow-sm backdrop-blur"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full max-w-xl rounded-2xl bg-white/95 p-6 text-gray-900 shadow-lg backdrop-blur">
              <h2 className="text-lg font-semibold text-gray-900">Plan your tour</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  Start date
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStartDate(value);
                      if (new Date(value) >= new Date(endDate)) {
                        const next = new Date(value);
                        next.setDate(next.getDate() + 1);
                        setEndDate(formatDateInput(next));
                      }
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  End date
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  Adults
                  <input
                    type="number"
                    min={1}
                    value={adults}
                    onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
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
                      className="rounded-lg border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    Infants
                    <input
                      type="number"
                      min={0}
                      value={infants}
                      onChange={(e) => setInfants(Math.max(0, Number(e.target.value)))}
                      className="rounded-lg border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                    />
                  </label>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">Days: {days}</p>
              <button
                onClick={() => {
                  const target = document.getElementById("tour-availability");
                  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700"
              >
                View available options
              </button>
              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 text-sm font-medium text-indigo-50 transition hover:text-white"
              >
                <FaMapMarkerAlt /> Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-12 flex max-w-6xl flex-col gap-12 px-6 pb-16">
        <section className="grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Tour location</h2>
              <p className="mt-2 text-sm text-gray-600">
                Explore the neighbourhood, nearby attractions, and the meeting point before you arrive.
              </p>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-indigo-600" />
                <span>{tour.location.city}, {tour.location.state}</span>
              </div>
              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                <FaMapMarkerAlt /> Open in Google Maps
              </a>
            </div>
          </div>
          <div className="h-72 w-full overflow-hidden rounded-2xl border border-gray-100 shadow-inner">
            <iframe
              src={mapEmbedUrl}
              title={`${tour.name} map`}
              loading="lazy"
              className="h-full w-full"
              allowFullScreen
            />
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl bg-white p-6 shadow-xl md:grid-cols-5">
          <div className="relative h-64 w-full overflow-hidden rounded-2xl md:col-span-3">
            {images.length > 0 ? (
              <Image src={images[galleryIndex]} alt={tour.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-100 text-gray-500">No photos</div>
            )}
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow"
              >
                View all photos
              </button>
            )}
          </div>
          <div className="grid gap-4 md:col-span-2">
            {images.slice(1, 4).map((image, idx) => (
              <div key={image + idx} className="relative h-32 overflow-hidden rounded-2xl">
                <Image src={image} alt={`${tour.name} photo ${idx + 2}`} fill className="object-cover" />
              </div>
            ))}
            {images.length <= 1 && (
              <div className="flex h-32 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                More images coming soon
              </div>
            )}
          </div>
        </section>

        {tourFacilities.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Most popular facilities</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {tourFacilities.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1 text-sm font-medium text-indigo-700"
                >
                  <span className="text-base leading-none">{getFacilityIcon(badge)}</span>
                  {badge}
                </span>
              ))}
            </div>
          </section>
        )}

        {tour.curatedHighlights && tour.curatedHighlights.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Why guests love this tour</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {tour.curatedHighlights.map((item, idx) => (
                <div key={item.title + idx} className="flex gap-3 rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
                  <div className="mt-1 text-lg text-indigo-600">{item.icon ? <i className={item.icon} /> : <FaCheck />}</div>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    {item.description && <p className="mt-1 text-indigo-700/90">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">About this tour</h2>
            <h3 className="mt-2 text-lg font-semibold text-gray-800">{tour.about.heading}</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {tour.about.description}
            </p>
            {tour.vendorMessage && (
              <div className="mt-4 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-800">
                <p className="font-semibold">Vendor message</p>
                <p className="mt-2 whitespace-pre-line">{tour.vendorMessage}</p>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Rules</h2>
            <div className="mt-3 space-y-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              {tour.defaultHouseRules && tour.defaultHouseRules.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {tour.defaultHouseRules.map((rule, idx) => (
                    <li key={rule + idx}>{rule}</li>
                  ))}
                </ul>
              )}
            </div>
            {tour.defaultCancellationPolicy && (
              <div className="mt-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Cancellation policy</p>
                <p className="mt-2 whitespace-pre-line">{tour.defaultCancellationPolicy}</p>
              </div>
            )}
          </div>
        </section>

        <section id="tour-availability" className="space-y-5 rounded-3xl bg-white p-6 shadow">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Availability</h2>
              <p className="text-sm text-gray-600">
                Pick your experience for {days} day{days === 1 ? "" : "s"} — you can mix and match different tour options.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-indigo-700">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1">
                <FaCheck /> Instant confirmation
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1">
                <FaInfoCircle /> Flexible scheduling
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Price / day</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {tour.options.map((option, idx) => {
                  const optionKey = option._id?.toString() || option.name;
                  const quantity = optionSelections[optionKey] || 0;
                  const isSelected = quantity > 0;
                  const isExpanded = expandedOptionKey === optionKey;
                  const available = option.available ?? 0;
                  const taxesNote = option.taxes ? `Taxes ₹${option.taxes.toLocaleString()} extra` : "Taxes included";

                  return (
                    <Fragment key={optionKey}>
                      <tr className={isSelected ? "bg-indigo-50/50 transition" : "transition hover:bg-gray-50/60"}>
                        <td className="align-top px-4 py-4 text-sm text-gray-700">
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-base font-semibold text-gray-900">{option.name}</span>
                              {isSelected && (
                                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                                  Selected
                                </span>
                              )}
                              {available <= 0 && (
                                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                                  Sold out
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              Duration: {option.duration} · Max group: {option.capacity}
                            </p>
                            {option.description && (
                              <p className="text-sm text-gray-600">{option.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="align-top px-4 py-4 text-sm text-gray-700">
                          <div className="flex flex-col gap-2">
                            {option.features?.length ? (
                              <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                                {option.features.slice(0, 3).map((feature) => (
                                  <span key={feature} className="rounded-full bg-gray-100 px-2 py-0.5">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Highlights coming soon</span>
                            )}
                            {option.amenities?.length ? (
                              <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                                {option.amenities.slice(0, 3).map((amenity) => (
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
                            <span className="text-lg font-semibold text-gray-900">₹{option.price.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">{taxesNote}</span>
                          </div>
                        </td>
                        <td className="align-top px-4 py-4">
                          <div className="flex flex-col items-stretch gap-3 text-sm sm:flex-row sm:items-center sm:justify-end">
                            <button
                              type="button"
                              onClick={() => setExpandedOptionKey(isExpanded ? null : optionKey)}
                              className="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-2 font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                            >
                              {isExpanded ? "Hide details" : "Show details"}
                            </button>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => stepOptionQuantity(optionKey, -1, available)}
                                disabled={quantity <= 0}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-lg font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                –
                              </button>
                              <span className="min-w-[2ch] text-center text-sm font-semibold text-gray-900">{quantity}</span>
                              <button
                                type="button"
                                onClick={() => stepOptionQuantity(optionKey, 1, available)}
                                disabled={available <= 0 || quantity >= available}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-lg font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleOptionSelection(optionKey, available)}
                              disabled={available <= 0}
                              className={`inline-flex items-center justify-center rounded-full px-4 py-2 font-semibold transition ${
                                isSelected
                                  ? "bg-indigo-600 text-white shadow hover:bg-indigo-700"
                                  : "border border-indigo-600 text-indigo-700 hover:bg-indigo-50 disabled:border-gray-300 disabled:text-gray-400"
                              } ${available <= 0 ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400" : ""}`}
                            >
                              {available <= 0 ? "Sold out" : isSelected ? "Selected" : "Select"}
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
                                  {option.images?.slice(0, 3).map((image, imageIdx) => (
                                    <div key={image + imageIdx} className="relative h-28 overflow-hidden rounded-xl">
                                      <Image src={image} alt={`${option.name} photo ${imageIdx + 1}`} fill className="object-cover" />
                                    </div>
                                  ))}
                                  {option.images && option.images.length > 3 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveOptionIndex(idx);
                                        setOptionImageIndex(0);
                                      }}
                                      className="flex h-28 items-center justify-center rounded-xl border border-dashed border-gray-300 text-xs font-semibold text-gray-600 transition hover:border-gray-400 hover:text-gray-800"
                                    >
                                      View {option.images.length - 3} more photos
                                    </button>
                                  )}
                                </div>
                                {option.description && (
                                  <p className="text-sm leading-relaxed text-gray-700">{option.description}</p>
                                )}
                              </div>

                              <div className="space-y-4 text-sm text-gray-700">
                                {option.amenities?.length ? (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Inclusions</p>
                                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                      {option.amenities.slice(0, 8).map((amenity) => (
                                        <span key={amenity} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
                                          <span className="text-indigo-600">{getFacilityIcon(amenity)}</span>
                                          <span>{amenity}</span>
                                        </span>
                                      ))}
                                    </div>
                                    {option.amenities.length > 8 && (
                                      <p className="mt-2 text-xs text-gray-500">
                                        +{option.amenities.length - 8} more inclusions
                                      </p>
                                    )}
                                  </div>
                                ) : null}

                                {option.features?.length ? (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Highlights</p>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                                      {option.features.map((feature) => (
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
              <p className="mt-2 text-gray-600">Options selected: {pricing.totalOptions}</p>
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
                Select at least one option above to continue to the booking form.
              </p>
            )}
            <button
              type="button"
              onClick={handleBookNow}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!pricing.totalOptions}
            >
              {pricing.totalOptions ? "Book now" : "Select an option to book"}
            </button>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-5 text-sm text-gray-700 shadow-inner">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">What happens next?</h3>
              <p>Clicking <strong>Book now</strong> will take you to a dedicated page where you can:</p>
              <ul className="ml-4 list-disc space-y-2 text-sm">
                <li>Review your tour summary and price breakdown</li>
                <li>Provide traveller details and contact information</li>
                <li>Add special requests before submitting the reservation</li>
              </ul>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              We hold your selection for a short time. Complete the form on the next page to confirm your booking.
            </p>
          </div>
        </section>

        {tour.amenities && Object.keys(tour.amenities).length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {Object.entries(tour.amenities).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{category}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {items.map((item, idx) => (
                      <li key={item + idx} className="flex items-start gap-3">
                        <span className="mt-0.5 text-indigo-600">{getFacilityIcon(item)}</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {(tour.videos?.inside?.length || tour.videos?.outside?.length) && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Experience in motion</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {["inside", "outside"].map((key) => (
                <div key={key} className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
                    <FaVideo /> {key === "inside" ? "Inside" : "Outside"} walk-through
                  </h3>
                  {(tour.videos as any)?.[key]?.length ? (
                    (tour.videos as any)[key].map((videoUrl: string, idx: number) => (
                      <video
                        key={videoUrl + idx}
                        controls
                        className="h-48 w-full overflow-hidden rounded-2xl bg-black"
                      >
                        <source src={videoUrl} />
                        Your browser does not support the video tag.
                      </video>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Video coming soon.</p>
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
            onClick={() => setGalleryIndex((prev) => (prev - 1 + images.length) % images.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/30 p-3 text-white"
          >
            <FaChevronLeft />
          </button>
          <div className="relative h-[70vh] w-full max-w-4xl overflow-hidden rounded-2xl">
            <Image src={images[galleryIndex]} alt={`Photo ${galleryIndex + 1}`} fill className="object-contain" />
          </div>
          <button
            type="button"
            onClick={() => setGalleryIndex((prev) => (prev + 1) % images.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/30 p-3 text-white"
          >
            <FaChevronRight />
          </button>
        </div>
      )}

      {activeOptionIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <button
            type="button"
            onClick={() => setActiveOptionIndex(null)}
            className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-sm text-white shadow"
          >
            Close
          </button>
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">{tour.options[activeOptionIndex].name}</h3>
            <div className="relative mt-4 h-72 overflow-hidden rounded-2xl">
              <Image
                src={tour.options[activeOptionIndex].images[optionImageIndex]}
                alt={`${tour.options[activeOptionIndex].name} image ${optionImageIndex + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setOptionImageIndex((prev) =>
                    (prev - 1 + tour.options[activeOptionIndex].images.length) %
                    tour.options[activeOptionIndex].images.length
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
              >
                <FaChevronLeft />
              </button>
              <button
                type="button"
                onClick={() =>
                  setOptionImageIndex((prev) =>
                    (prev + 1) % tour.options[activeOptionIndex].images.length
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
              >
                <FaChevronRight />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {tour.options[activeOptionIndex].images.map((image, idx) => (
                <button
                  type="button"
                  key={image + idx}
                  onClick={() => setOptionImageIndex(idx)}
                  className={`relative h-20 overflow-hidden rounded-lg ${
                    optionImageIndex === idx ? "ring-2 ring-indigo-500" : ""
                  }`}
                >
                  <Image src={image} alt={`${tour.options[activeOptionIndex].name} thumb ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
            {tour.options[activeOptionIndex].description && (
              <p className="mt-4 text-sm text-gray-600">
                {tour.options[activeOptionIndex].description}
              </p>
            )}
            {tour.options[activeOptionIndex].amenities?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Amenities</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                  {tour.options[activeOptionIndex].amenities.map((amenity) => (
                    <span key={amenity} className="rounded-full bg-gray-100 px-3 py-1">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TourDetailClient;