// tours/tourDetailClient.tsx
"use client";

import { useMemo, useState, type JSX } from "react";
import Image from "next/image";
import {
  FaArrowLeft,
  FaBed,
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

  const handleOptionQuantityChange = (optionKey: string, quantity: number) => {
    setOptionSelections((prev) => ({ ...prev, [optionKey]: quantity }));
  };

  const handleBookingSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBookingError(null);

    if (!pricing.totalOptions) {
      setBookingError("Select at least one option to continue.");
      return;
    }

    if (!guestDetails.fullName || !guestDetails.email) {
      setBookingError("Please provide your name and email address.");
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        tourId: tour._id,
        startDate,
        endDate,
        guests: { adults, children, infants },
        customer: {
          fullName: guestDetails.fullName,
          email: guestDetails.email,
          phone: guestDetails.phone,
          notes: guestDetails.notes,
        },
        currency: pricing.selectedOptions[0]?.option.currency || "INR",
        options: pricing.selectedOptions.map(({ option, quantity, price, optionTaxes }) => ({
          optionId: option._id,
          optionName: option.name,
          quantity,
          price,
          taxes: optionTaxes,
        })),
        fees: 0,
      };

      const res = await fetch("/api/bookings/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to complete booking");
      }

      setBookingSuccess(data.booking);
      setShowBookingForm(false);
    } catch (err: any) {
      setBookingError(err?.message || "We couldn't complete your booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const tourFacilities = tour.popularFacilities || [];
  const hasRating = tour.rating && tour.rating.count;

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      <header className="relative isolate overflow-hidden bg-linear-to-br from-green-600 via-green-500 to-lime-400 pb-16 pt-20 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              tour.images?.length
                ? `url(${tour.images[0]})`
                : "url('https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6">
          <button
            onClick={() => router.back()}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white backdrop-blur transition hover:bg-white/25"
          >
            <FaArrowLeft /> Back to tours
          </button>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
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
                {tour.location.address}, {tour.location.city}, {tour.location.state}
              </p>
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
                <div className="mt-4 flex flex-wrap gap-2">
                  {tour.heroHighlights.slice(0, 4).map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white shadow"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full max-w-xl rounded-2xl bg-white/95 p-6 text-gray-900 shadow-lg backdrop-blur">
              <h2 className="text-lg font-semibold text-gray-900">Trip planner</h2>
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
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  End date
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  Adults
                  <input
                    type="number"
                    min={1}
                    value={adults}
                    onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
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
                      className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    Infants
                    <input
                      type="number"
                      min={0}
                      value={infants}
                      onChange={(e) => setInfants(Math.max(0, Number(e.target.value)))}
                      className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                    />
                  </label>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">Days: {days}</p>
              <button
                onClick={() => setShowBookingForm(true)}
                className="mt-4 w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-green-700"
              >
                Start booking
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-12 flex max-w-6xl flex-col gap-12 px-6 pb-16">
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
                  className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1 text-sm font-medium text-green-700"
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
                <div key={item.title + idx} className="flex gap-3 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">
                  <div className="mt-1 text-lg text-green-600">{item.icon ? <i className={item.icon} /> : <FaCheck />}</div>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    {item.description && <p className="mt-1 text-green-700/90">{item.description}</p>}
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
              <div className="mt-4 rounded-2xl bg-green-50 p-4 text-sm text-green-800">
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

        <section className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Tour options</h2>
            <p className="text-sm text-gray-600">
              Choose from {tour.options.length} curated option{tour.options.length === 1 ? "" : "s"} with detailed amenities.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {tour.options.map((option, idx) => {
              const optionKey = option._id?.toString() || option.name;
              const quantity = optionSelections[optionKey] || 0;
              return (
                <div key={optionKey} className="flex flex-col rounded-3xl bg-white p-5 shadow">
                  <div className="relative h-48 w-full overflow-hidden rounded-2xl">
                    {option.images?.length ? (
                      <Image
                        src={option.images[0]}
                        alt={option.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-100 text-gray-500">
                        Option image coming soon
                      </div>
                    )}
                    {option.images?.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveOptionIndex(idx);
                          setOptionImageIndex(0);
                        }}
                        className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow"
                      >
                        View gallery
                      </button>
                    )}
                  </div>
                  <div className="mt-4 space-y-3 text-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{option.name}</h3>
                        <p className="text-xs text-gray-500">
                          Duration: {option.duration} · Capacity: {option.capacity}
                        </p>
                      </div>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                        ₹{option.price.toLocaleString()}
                      </span>
                    </div>
                    {option.description && (
                      <p className="text-sm leading-relaxed text-gray-700">{option.description}</p>
                    )}
                    {option.features?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Highlights</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                          {option.features.slice(0, 6).map((feature) => (
                            <span key={feature} className="rounded-full bg-gray-100 px-3 py-1">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <label className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm">
                      <span className="text-gray-700">Number to book</span>
                      <select
                        value={quantity}
                        onChange={(e) => handleOptionQuantityChange(optionKey, Number(e.target.value))}
                        className="rounded-lg border border-gray-200 px-3 py-1 focus:border-green-500 focus:outline-none"
                      >
                        {Array.from(
                          {
                            length: Math.min(6, Math.max(0, option.available ?? 0)) + 1,
                          },
                          (_, optionIdx) => optionIdx
                        ).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="text-xs text-gray-500">
                      {option.isRefundable ? (
                        <>Free cancellation up to {option.refundableUntilHours ?? 48}h before</>
                      ) : (
                        <>Non-refundable rate</>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

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
                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₹{pricing.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            {!pricing.totalOptions && (
              <p className="text-xs text-amber-600">
                Select at least one option above to continue to the booking form.
              </p>
            )}
            {!bookingSuccess && (
              <button
                type="button"
                onClick={() => setShowBookingForm(true)}
                className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-green-700"
                disabled={!pricing.totalOptions}
              >
                {showBookingForm ? "Update guest details" : "Continue to guest details"}
              </button>
            )}
            {bookingSuccess && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <p className="font-semibold">Booking confirmed!</p>
                <p className="mt-2">Reference: {bookingSuccess._id}</p>
                <p className="mt-2 text-green-700/90">
                  A confirmation email has been sent to {bookingSuccess.customer?.email}. Check vendor and admin dashboards for booking details.
                </p>
              </div>
            )}
          </div>

          {showBookingForm && !bookingSuccess && (
            <form
              onSubmit={handleBookingSubmit}
              className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900">Guest details</h3>
              <label className="flex flex-col gap-1">
                Full name
                <input
                  type="text"
                  required
                  value={guestDetails.fullName}
                  onChange={(e) => setGuestDetails((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                Email address
                <input
                  type="email"
                  required
                  value={guestDetails.email}
                  onChange={(e) => setGuestDetails((prev) => ({ ...prev, email: e.target.value }))}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                Phone number (optional)
                <input
                  type="tel"
                  value={guestDetails.phone}
                  onChange={(e) => setGuestDetails((prev) => ({ ...prev, phone: e.target.value }))}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                Special requests (optional)
                <textarea
                  rows={3}
                  value={guestDetails.notes}
                  onChange={(e) => setGuestDetails((prev) => ({ ...prev, notes: e.target.value }))}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
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
                className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-green-700 disabled:opacity-60"
              >
                {bookingLoading ? "Completing booking…" : "Complete booking"}
              </button>
            </form>
          )}
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
                        <span className="mt-0.5 text-green-600">{getFacilityIcon(item)}</span>
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
                    optionImageIndex === idx ? "ring-2 ring-green-500" : ""
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