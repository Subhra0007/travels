// app/vehicle-rental/vehicleRentalDetailClient.tsx
"use client";

import { Fragment, useMemo, useState,type JSX } from "react";
import Image from "next/image";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaMapMarkerAlt,
  FaStar,
  FaTag,
  FaVideo,
  FaCar,
  FaMotorcycle,
  FaGasPump,
  FaCogs,
  FaSnowflake,
  FaShieldAlt,
  FaKey,
  FaBluetooth,
  FaUsb,
  FaCamera,
  FaInfoCircle,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/app/hooks/useWishlist";

export type VehicleRentalDetailPayload = {
  _id: string;
  name: string;
  category: "cars-rental" | "bikes-rentals";
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
  amenities?: Record<string, string[]>;
  options: Array<{
    _id?: string;
    model: string;
    description?: string;
    type: string;
    pricePerDay: number;
    taxes?: number;
    currency?: string;
    features: string[];
    amenities?: string[];
    images: string[];
    available?: number;
    isRefundable?: boolean;
    refundableUntilHours?: number;
  }>;
  about: { heading: string; description: string };
  checkInOutRules: { pickup: string; dropoff: string; rules: string[] };
  defaultCancellationPolicy?: string;
  defaultHouseRules?: string[];
  vendorMessage?: string;
};

const facilityIconMap: Record<string, JSX.Element> = {
  ac: <FaSnowflake />,
  "air conditioning": <FaSnowflake />,
  bluetooth: <FaBluetooth />,
  usb: <FaUsb />,
  camera: <FaCamera />,
  gps: <FaMapMarkerAlt />,
  fuel: <FaGasPump />,
  transmission: <FaCogs />,
  insurance: <FaShieldAlt />,
  keyless: <FaKey />,
};

const getIcon = (label: string) => {
  const key = label.toLowerCase();
  const match = Object.entries(facilityIconMap).find(([k]) => key.includes(k));
  return match ? match[1] : <FaCheck />;
};

const formatDateInput = (date: Date) => `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;

const calculateDays = (start: string, end: string) => {
  if (!start || !end) return 1;
  const pickup = new Date(start);
  const dropoff = new Date(end);
  if (Number.isNaN(pickup.getTime()) || Number.isNaN(dropoff.getTime()) || dropoff <= pickup) return 1;
  return Math.max(1, Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)));
};

const getDefaultDates = () => {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  return { pickup: formatDateInput(today), dropoff: formatDateInput(tomorrow) };
};

interface Props {
  rental: VehicleRentalDetailPayload;
}

const VehicleRentalDetailClient: React.FC<Props> = ({ rental }) => {
  const router = useRouter();
  const { wishlistIds, toggleWishlist, wishlistLoaded } = useWishlist({ autoLoad: true });
  const isWishlisted = wishlistIds.has(rental._id);

  const images = useMemo(() => [...rental.images, ...(rental.gallery || [])].filter(Boolean), [rental.images, rental.gallery]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [activeVehicleIdx, setActiveVehicleIdx] = useState<number | null>(null);
  const [vehicleImageIdx, setVehicleImageIdx] = useState(0);

  const { pickup: defaultPickup, dropoff: defaultDropoff } = useMemo(() => getDefaultDates(), []);
  const [pickupDate, setPickupDate] = useState(defaultPickup);
  const [dropoffDate, setDropoffDate] = useState(defaultDropoff);

  const initialSelections = useMemo(() => {
    const map: Record<string, number> = {};
    rental.options.forEach((vehicle) => {
      const key = vehicle._id?.toString() || vehicle.model;
      map[key] = 0;
    });
    return map;
  }, [rental.options]);

  const [vehicleSelections, setVehicleSelections] = useState<Record<string, number>>(initialSelections);
  const [expandedVehicleKey, setExpandedVehicleKey] = useState<string | null>(null);

  const days = useMemo(() => calculateDays(pickupDate, dropoffDate), [pickupDate, dropoffDate]);

  const pricing = useMemo(() => {
    let subtotal = 0;
    let taxes = 0;
    const vehicles = rental.options.map((vehicle) => {
      const vehicleKey = vehicle._id?.toString() || vehicle.model;
      const quantity = vehicleSelections[vehicleKey] || 0;
      if (!quantity) return null;
      const taxPerDay = vehicle.taxes ?? 0;
      subtotal += vehicle.pricePerDay * quantity * days;
      taxes += taxPerDay * quantity * days;
      return { vehicle, quantity, taxPerDay };
    });

    return {
      subtotal,
      taxes,
      total: subtotal + taxes,
      selectedVehicles: vehicles.filter(Boolean) as Array<{
        vehicle: VehicleRentalDetailPayload["options"][number];
        quantity: number;
        taxPerDay: number;
      }> ,
    };
  }, [vehicleSelections, rental.options, days]);

  const platformFee = pricing.selectedVehicles.length ? 15 : 0;
  const grandTotal = pricing.total + platformFee;

  const locationString = useMemo(
    () => [rental.location.address, rental.location.city, rental.location.state, rental.location.country].filter(Boolean).join(", "),
    [rental.location.address, rental.location.city, rental.location.state, rental.location.country]
  );

  const mapEmbedUrl = useMemo(
    () => `https://www.google.com/maps?q=${encodeURIComponent(locationString)}&output=embed`,
    [locationString]
  );

  const mapDirectionsUrl = useMemo(
    () => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationString)}`,
    [locationString]
  );

  const toggleVehicleSelection = (vehicleKey: string, available: number) => {
    setVehicleSelections((prev) => {
      const current = prev[vehicleKey] || 0;
      if (available <= 0) {
        return { ...prev, [vehicleKey]: 0 };
      }
      return { ...prev, [vehicleKey]: current > 0 ? 0 : 1 };
    });
  };

  const stepVehicleQuantity = (vehicleKey: string, delta: number, maxAvailable: number) => {
    setVehicleSelections((prev) => {
      const allowedMax = Math.max(0, maxAvailable ?? 0);
      const current = prev[vehicleKey] || 0;
      const next = Math.min(Math.max(current + delta, 0), allowedMax);
      return { ...prev, [vehicleKey]: next };
    });
  };

  const handleBookNow = () => {
    if (!pricing.selectedVehicles.length) return;

    const params = new URLSearchParams({
      pickup: pickupDate,
      dropoff: dropoffDate,
    });

    pricing.selectedVehicles.forEach(({ vehicle, quantity }) => {
      const vehicleKey = vehicle._id?.toString() || vehicle.model;
      params.append("vehicles", `${vehicleKey}:${quantity}`);
    });

    router.push(`/vehicle-rental/${rental._id}/book?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      <header className="relative isolate overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 pb-20 pt-16 text-white">
        {/* <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: rental.images?.length ? `url(${rental.images[0]})` : "url('/placeholder.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        /> */}
        <div className="relative mx-auto max-w-6xl px-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur transition hover:bg-white/25"
          >
            <FaArrowLeft /> Back to rentals
          </button>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
            <div className="max-w-3xl">
              <div className="flex items-start justify-between gap-6">
                <div className="max-w-xl">
                  <p className="uppercase tracking-wide text-white/80">
                    {rental.category === "cars-rental" ? "Car Rental" : "Bike Rental"}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <h1 className="text-3xl font-bold leading-snug sm:text-4xl md:text-5xl">{rental.name}</h1>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(rental._id, !isWishlisted, "vehicle-rental")}
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

              {rental.tags && rental.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {rental.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                      <FaTag /> {tag}
                    </span>
                  ))}
                </div>
              )}
              {rental.rating?.count && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
                  <FaStar className="text-yellow-300" /> {rental.rating.average.toFixed(1)} · {rental.rating.count} reviews
                </div>
              )}
              {rental.heroHighlights?.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {rental.heroHighlights.slice(0, 3).map((highlight) => (
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
              <h2 className="text-lg font-semibold">Plan your ride</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  Pickup
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPickupDate(value);
                      if (new Date(value) >= new Date(dropoffDate)) {
                        const fallback = new Date(value);
                        fallback.setDate(fallback.getDate() + 1);
                        setDropoffDate(formatDateInput(fallback));
                      }
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Drop-off
                  <input
                    type="date"
                    min={pickupDate}
                    value={dropoffDate}
                    onChange={(e) => setDropoffDate(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </label>
              </div>
              <p className="mt-3 text-sm text-gray-600">Rental duration: {days} day{days === 1 ? "" : "s"}</p>
              <button
                onClick={() => {
                  const target = document.getElementById("vehicle-availability");
                  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700"
              >
                View available vehicles
              </button>
              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 text-sm font-medium text-blue-50 transition hover:text-white"
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
              <h2 className="text-xl font-semibold text-gray-900">Rental location</h2>
              <p className="mt-2 text-sm text-gray-600">
                Explore the pickup spot, nearby fuel stations, and navigation routes before you arrive.
              </p>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-600" />
                <span>{rental.location.city}, {rental.location.state}</span>
              </div>
              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                <FaMapMarkerAlt /> Open in Google Maps
              </a>
            </div>
          </div>
          <div className="h-72 w-full overflow-hidden rounded-2xl border border-gray-100 shadow-inner">
            <iframe src={mapEmbedUrl} title={`${rental.name} map`} loading="lazy" className="h-full w-full" allowFullScreen />
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl bg-white p-6 shadow-xl md:grid-cols-5">
          <div className="relative h-64 overflow-hidden rounded-2xl md:col-span-3">
            {images.length ? (
              <Image src={images[galleryIdx]} alt={rental.name} fill className="object-cover" />
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
            {images.slice(1, 4).map((img, idx) => (
              <div key={img + idx} className="relative h-32 overflow-hidden rounded-2xl">
                <Image src={img} alt={`${rental.name} photo ${idx + 2}`} fill className="object-cover" />
              </div>
            ))}
            {images.length <= 1 && (
              <div className="flex h-32 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                More images coming soon
              </div>
            )}
          </div>
        </section>

        {rental.popularFacilities.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Popular facilities</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {rental.popularFacilities.map((facility) => (
                <span
                  key={facility}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700"
                >
                  <span className="text-base leading-none">{getIcon(facility)}</span>
                  {facility}
                </span>
              ))}
            </div>
          </section>
        )}

        {rental.curatedHighlights && rental.curatedHighlights.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Why guests love this rental</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {rental.curatedHighlights.map((item, idx) => (
                <div key={item.title + idx} className="flex gap-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  <div className="mt-1 text-lg text-blue-600">{item.icon ? <i className={item.icon} /> : <FaCheck />}</div>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    {item.description && <p className="mt-1 text-blue-700/90">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">About this rental</h2>
            <h3 className="mt-2 text-lg font-semibold text-gray-800">{rental.about.heading}</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">{rental.about.description}</p>
            {rental.vendorMessage && (
              <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
                <p className="font-semibold">Vendor message</p>
                <p className="mt-2 whitespace-pre-line">{rental.vendorMessage}</p>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">Pickup & Drop-off</h2>
            <div className="mt-3 space-y-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              <p><strong>Pickup:</strong> {rental.checkInOutRules.pickup}</p>
              <p><strong>Drop-off:</strong> {rental.checkInOutRules.dropoff}</p>
              {rental.checkInOutRules.rules?.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold text-gray-900 mb-1">Additional Rules:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    {rental.checkInOutRules.rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {rental.defaultCancellationPolicy && (
              <div className="mt-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Cancellation policy</p>
                <p className="mt-2 whitespace-pre-line">{rental.defaultCancellationPolicy}</p>
              </div>
            )}
          </div>
        </section>

        <section id="vehicle-availability" className="space-y-5 rounded-3xl bg-white p-6 shadow">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Vehicle availability</h2>
              <p className="text-sm text-gray-600">
                Choose one or more vehicles for {days} day{days === 1 ? "" : "s"}. You can mix different models.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-blue-700">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1">
                <FaCheck /> Verified fleet
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1">
                <FaInfoCircle /> Flexible pickup
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Specs & highlights</th>
                  <th className="px-4 py-3">Price / day</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {rental.options.map((vehicle, idx) => {
                  const vehicleKey = vehicle._id?.toString() || vehicle.model;
                  const quantity = vehicleSelections[vehicleKey] || 0;
                  const isSelected = quantity > 0;
                  const isExpanded = expandedVehicleKey === vehicleKey;
                  const available = vehicle.available ?? 0;
                  const taxesNote = vehicle.taxes ? `Taxes ₹${vehicle.taxes.toLocaleString()} extra` : "Taxes included";

                  return (
                    <Fragment key={vehicleKey}>
                      <tr className={isSelected ? "bg-blue-50/50 transition" : "transition hover:bg-gray-50/60"}>
                        <td className="align-top px-4 py-4 text-sm text-gray-700">
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-base font-semibold text-gray-900">{vehicle.model}</span>
                              {isSelected && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
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
                              {vehicle.type}
                              {typeof vehicle.available === "number" && ` · Available: ${vehicle.available}`}
                            </p>
                            {vehicle.description && (
                              <p className="text-sm text-gray-600">{vehicle.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="align-top px-4 py-4 text-sm text-gray-700">
                          <div className="flex flex-col gap-2">
                            {vehicle.features?.length ? (
                              <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                                {vehicle.features.slice(0, 3).map((feature) => (
                                  <span key={feature} className="rounded-full bg-gray-100 px-2 py-0.5">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Highlights coming soon</span>
                            )}
                            {vehicle.amenities?.length ? (
                              <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                                {vehicle.amenities.slice(0, 3).map((amenity) => (
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
                            <span className="text-lg font-semibold text-gray-900">
                              ₹{vehicle.pricePerDay.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500">{taxesNote}</span>
                          </div>
                        </td>
                        <td className="align-top px-4 py-4">
                          <div className="flex flex-col items-stretch gap-3 text-sm sm:flex-row sm:items-center sm:justify-end">
                            <button
                              type="button"
                              onClick={() => setExpandedVehicleKey(isExpanded ? null : vehicleKey)}
                              className="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-2 font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                            >
                              {isExpanded ? "Hide details" : "Show details"}
                            </button>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => stepVehicleQuantity(vehicleKey, -1, available)}
                                disabled={quantity <= 0}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-lg font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                –
                              </button>
                              <span className="min-w-[2ch] text-center text-sm font-semibold text-gray-900">{quantity}</span>
                              <button
                                type="button"
                                onClick={() => stepVehicleQuantity(vehicleKey, 1, available)}
                                disabled={available <= 0 || quantity >= available}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-lg font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleVehicleSelection(vehicleKey, available)}
                              disabled={available <= 0}
                              className={`inline-flex items-center justify-center rounded-full px-4 py-2 font-semibold transition ${
                                isSelected
                                  ? "bg-blue-600 text-white shadow hover:bg-blue-700"
                                  : "border border-blue-600 text-blue-700 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400"
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
                                  {vehicle.images?.slice(0, 3).map((image, imageIdx) => (
                                    <div key={image + imageIdx} className="relative h-28 overflow-hidden rounded-xl">
                                      <Image src={image} alt={`${vehicle.model} photo ${imageIdx + 1}`} fill className="object-cover" />
                                    </div>
                                  ))}
                                  {vehicle.images && vehicle.images.length > 3 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveVehicleIdx(idx);
                                        setVehicleImageIdx(0);
                                      }}
                                      className="flex h-28 items-center justify-center rounded-xl border border-dashed border-gray-300 text-xs font-semibold text-gray-600 transition hover:border-gray-400 hover:text-gray-800"
                                    >
                                      View {vehicle.images.length - 3} more photos
                                    </button>
                                  )}
                                </div>
                                {vehicle.description && (
                                  <p className="text-sm text-gray-600">{vehicle.description}</p>
                                )}
                              </div>

                              <div className="space-y-4 text-sm text-gray-700">
                                {vehicle.amenities?.length ? (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Amenities</p>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                                      {vehicle.amenities.map((amenity) => (
                                        <span key={amenity} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
                                          <span className="text-blue-600">{getIcon(amenity)}</span>
                                          {amenity}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}

                                {vehicle.features?.length ? (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Highlights</p>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                                      {vehicle.features.map((feature) => (
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
                <FaCalendarAlt /> {pickupDate} → {dropoffDate} ({days} day{days === 1 ? "" : "s"})
              </p>
              <p className="mt-2 text-gray-600">Vehicles selected: {pricing.selectedVehicles.length}</p>
              <div className="mt-4 space-y-2 border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{pricing.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & fees</span>
                  <span>₹{pricing.taxes.toLocaleString()}</span>
                </div>
                {pricing.selectedVehicles.length > 0 && (
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
            {!pricing.selectedVehicles.length && (
              <p className="text-xs text-amber-600">Select at least one vehicle to continue to the booking form.</p>
            )}
            <button
              type="button"
              onClick={handleBookNow}
              disabled={!pricing.selectedVehicles.length}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pricing.selectedVehicles.length ? "Book now" : "Select a vehicle to book"}
            </button>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-100 p-5 text-sm text-gray-700 shadow-inner">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">What happens next?</h3>
              <p>Click <strong>Book now</strong> to complete your reservation on the next page:</p>
              <ul className="ml-4 list-disc space-y-2 text-sm">
                <li>Review driver details and contact information</li>
                <li>Confirm pickup & drop-off instructions with the vendor</li>
                <li>Add licence notes or special requests before submitting</li>
              </ul>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              We reserve your selected vehicles temporarily. Complete the next step to confirm the booking with the vendor.
            </p>
          </div>
        </section>

        {rental.amenities && Object.keys(rental.amenities).length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Amenities & Features</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {Object.entries(rental.amenities).map(([sectionKey, items]) => (
                <div key={sectionKey}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{sectionKey}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {items.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                      >
                        <FaCheck className="text-blue-600" /> {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(rental.videos?.inside?.length || rental.videos?.outside?.length) && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Videos</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {(["inside", "outside"] as const).map((key) => (
                <div key={key} className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                    <FaVideo className="mr-2 inline" /> {key === "inside" ? "Interior" : "Exterior"}
                  </h3>
                  {(rental.videos as any)?.[key]?.length ? (
                    (rental.videos as any)[key].map((videoUrl: string, idx: number) => (
                      <video key={videoUrl + idx} controls className="h-48 w-full rounded-2xl bg-black">
                        <source src={videoUrl} />
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
            onClick={() => setGalleryIdx((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/30 p-3 text-white"
          >
            <FaChevronLeft />
          </button>
          <div className="relative h-[70vh] w-full max-w-4xl overflow-hidden rounded-2xl">
            <Image src={images[galleryIdx]} alt={`Vehicle photo ${galleryIdx + 1}`} fill className="object-contain" />
          </div>
          <button
            type="button"
            onClick={() => setGalleryIdx((i) => (i + 1) % images.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/30 p-3 text-white"
          >
            <FaChevronRight />
          </button>
        </div>
      )}

      {activeVehicleIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <button
            type="button"
            onClick={() => setActiveVehicleIdx(null)}
            className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-sm text-white shadow"
          >
            Close
          </button>
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">{rental.options[activeVehicleIdx].model}</h3>
            <div className="relative mt-4 h-72 overflow-hidden rounded-2xl">
              <Image
                src={rental.options[activeVehicleIdx].images[vehicleImageIdx]}
                alt={`${rental.options[activeVehicleIdx].model} image ${vehicleImageIdx + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setVehicleImageIdx((i) => (i - 1 + rental.options[activeVehicleIdx].images.length) % rental.options[activeVehicleIdx].images.length)
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
              >
                <FaChevronLeft />
              </button>
              <button
                type="button"
                onClick={() =>
                  setVehicleImageIdx((i) => (i + 1) % rental.options[activeVehicleIdx].images.length)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
              >
                <FaChevronRight />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {rental.options[activeVehicleIdx].images.map((img, idx) => (
                <button
                  key={img + idx}
                  type="button"
                  onClick={() => setVehicleImageIdx(idx)}
                  className={`relative h-20 overflow-hidden rounded-lg ${vehicleImageIdx === idx ? "ring-2 ring-blue-500" : ""}`}
                >
                  <Image src={img} alt={`${rental.options[activeVehicleIdx].model} thumb ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
            {rental.options[activeVehicleIdx].description && (
              <p className="mt-4 text-sm text-gray-600">{rental.options[activeVehicleIdx].description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleRentalDetailClient;
