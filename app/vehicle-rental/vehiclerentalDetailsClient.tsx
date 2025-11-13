// app/vehicle-rental/vehicleRentalDetailClient.tsx
"use client";

import { useMemo, useState } from "react";
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

const facilityIconMap: Record<string, any> = {
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

interface Props {
  rental: VehicleRentalDetailPayload;
}

const VehicleRentalDetailClient: React.FC<Props> = ({ rental }) => {
  const router = useRouter();
  const { wishlistIds, toggleWishlist, wishlistLoaded } = useWishlist({ autoLoad: true });
  const isWishlisted = wishlistIds.has(rental._id);

  const allImages = useMemo(() => [...rental.images, ...(rental.gallery || [])].filter(Boolean), [rental]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [optionIdx, setOptionIdx] = useState<number | null>(null);
  const [optionImgIdx, setOptionImgIdx] = useState(0);

  const [pickupDate, setPickupDate] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [quantity, setQuantity] = useState<Record<string, number>>({});

  const days = useMemo(() => {
    if (!pickupDate || !dropoffDate) return 1;
    const start = new Date(pickupDate);
    const end = new Date(dropoffDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }, [pickupDate, dropoffDate]);

  const pricing = useMemo(() => {
    let subtotal = 0;
    let taxes = 0;
    const selected = rental.options
      .map((opt) => {
        const qty = quantity[opt._id || opt.model] || 0;
        if (!qty) return null;
        const optionSubtotal = opt.pricePerDay * qty * days;
        subtotal += optionSubtotal;
        if (opt.taxes && opt.taxes > 0) {
          taxes += (opt.taxes * qty * days);
        }
        return { opt, qty };
      })
      .filter(Boolean);
    const total = subtotal + taxes;
    return { subtotal, taxes, total, selected: selected as any[] };
  }, [quantity, rental.options, days]);

  const handleBooking = () => {
    if (!pricing.selected.length) return alert("Select at least one vehicle");
    alert(`Booking ${pricing.selected.length} vehicle(s) for ${days} day(s) — ₹${pricing.total}`);
    // Call /api/bookings/vehicle-rentals
  };

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      {/* Header */}
      <header className="relative isolate overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 pb-16 pt-20 text-white">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: rental.images[0] ? `url(${rental.images[0]})` : "url('/placeholder.jpg')" }}
        />
        <div className="relative mx-auto max-w-6xl px-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur hover:bg-white/25"
          >
            <FaArrowLeft /> Back
          </button>

          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="uppercase tracking-wide text-white/80">
                {rental.category === "cars-rental" ? "Car Rental" : "Bike Rental"}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">{rental.name}</h1>
                <button
                  type="button"
                  onClick={() => toggleWishlist(rental._id, !isWishlisted, "vehicle-rental")}
                  disabled={!wishlistLoaded}
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur ${
                    !wishlistLoaded ? "cursor-not-allowed opacity-60" : ""
                  }`}
                >
                  <FaHeart className={isWishlisted ? "text-red-400" : "text-white"} />
                </button>
              </div>
              <p className="mt-3 flex items-center text-base text-white/90">
                <FaMapMarkerAlt className="mr-2" />
                {rental.location.city}, {rental.location.state}
              </p>
              {rental.rating?.count && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
                  <FaStar className="text-yellow-300" /> {rental.rating.average.toFixed(1)} · {rental.rating.count} reviews
                </div>
              )}
              {rental.heroHighlights?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {rental.heroHighlights.slice(0, 4).map((h) => (
                    <span key={h} className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium shadow">
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Card */}
            <div className="w-full max-w-xl rounded-2xl bg-white/95 p-6 text-gray-900 shadow-lg backdrop-blur">
              <h2 className="text-lg font-semibold">Book your ride</h2>
              <div className="mt-4 space-y-3">
                <label className="flex flex-col gap-1 text-sm">
                  Pickup Date
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Dropoff Date
                  <input
                    type="date"
                    min={pickupDate}
                    value={dropoffDate}
                    onChange={(e) => setDropoffDate(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500"
                  />
                </label>
                <p className="text-sm text-gray-600">Duration: {days} day{days > 1 ? "s" : ""}</p>
              </div>
              <button
                onClick={handleBooking}
                className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto -mt-12 max-w-6xl px-6 pb-16">
        {/* Gallery */}
        <section className="grid gap-4 rounded-3xl bg-white p-6 shadow-xl md:grid-cols-5">
          <div className="relative h-64 overflow-hidden rounded-2xl md:col-span-3">
            {allImages[galleryIdx] ? (
              <Image src={allImages[galleryIdx]} alt="" fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-100">No photo</div>
            )}
            {allImages.length > 1 && (
              <button
                onClick={() => setGalleryOpen(true)}
                className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold shadow"
              >
                View all
              </button>
            )}
          </div>
          <div className="grid gap-4 md:col-span-2">
            {allImages.slice(1, 4).map((img, i) => (
              <div key={i} className="relative h-32 overflow-hidden rounded-2xl">
                <Image src={img} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </section>

        {/* Tags */}
        {rental.tags && rental.tags.length > 0 && (
          <section className="mt-8 rounded-3xl bg-white p-6 shadow">
            <div className="flex flex-wrap gap-2">
              {rental.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                >
                  <FaTag className="text-xs" /> {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Facilities */}
        {rental.popularFacilities.length > 0 && (
          <section className="mt-8 rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Popular facilities</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {rental.popularFacilities.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700"
                >
                  {getIcon(f)} {f}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Curated Highlights */}
        {rental.curatedHighlights && rental.curatedHighlights.length > 0 && (
          <section className="mt-8 rounded-3xl bg-white p-6 shadow">
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

        {/* Amenities */}
        {rental.amenities && Object.keys(rental.amenities).length > 0 && (
          <section className="mt-8 rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Amenities & Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(rental.amenities).map(([sectionKey, items]) => (
                <div key={sectionKey}>
                  <h3 className="font-medium mb-2 text-gray-800">{sectionKey}</h3>
                  <div className="flex flex-wrap gap-2">
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

        {/* Videos */}
        {(rental.videos?.inside?.length || rental.videos?.outside?.length) && (
          <section className="mt-8 rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rental.videos.inside && rental.videos.inside.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 text-gray-700">Inside Videos</h3>
                  <div className="space-y-3">
                    {rental.videos.inside.map((src, i) => (
                      <div key={i} className="relative w-full rounded-lg overflow-hidden bg-black">
                        <video src={src} controls className="w-full h-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {rental.videos.outside && rental.videos.outside.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 text-gray-700">Outside Videos</h3>
                  <div className="space-y-3">
                    {rental.videos.outside.map((src, i) => (
                      <div key={i} className="relative w-full rounded-lg overflow-hidden bg-black">
                        <video src={src} controls className="w-full h-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* About */}
        <section className="mt-8 grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-2">
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
            <h2 className="text-xl font-semibold">Pickup & Dropoff</h2>
            <div className="mt-3 space-y-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              <p><strong>Pickup:</strong> {rental.checkInOutRules.pickup}</p>
              <p><strong>Dropoff:</strong> {rental.checkInOutRules.dropoff}</p>
              {rental.checkInOutRules.rules?.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold text-gray-900 mb-1">Additional Rules:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    {rental.checkInOutRules.rules.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {rental.defaultHouseRules && rental.defaultHouseRules.length > 0 && (
              <div className="mt-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900 mb-2">House Rules</p>
                <ul className="list-disc space-y-1 pl-5">
                  {rental.defaultHouseRules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
            {rental.defaultCancellationPolicy && (
              <div className="mt-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Cancellation policy</p>
                <p className="mt-2 whitespace-pre-line">{rental.defaultCancellationPolicy}</p>
              </div>
            )}
          </div>
        </section>

        {/* Vehicles */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Available vehicles</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {rental.options.map((opt, idx) => {
              const key = opt._id || opt.model;
              const qty = quantity[key] || 0;
              return (
                <div key={key} className="flex flex-col rounded-3xl bg-white p-5 shadow">
                  <div className="relative h-48 overflow-hidden rounded-2xl">
                    {opt.images[0] ? (
                      <Image src={opt.images[0]} alt={opt.model} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-100">
                        {rental.category === "cars-rental" ? <FaCar /> : <FaMotorcycle />}
                      </div>
                    )}
                    {opt.images.length > 1 && (
                      <button
                        onClick={() => { setOptionIdx(idx); setOptionImgIdx(0); }}
                        className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold shadow"
                      >
                        Gallery
                      </button>
                    )}
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{opt.model}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {opt.type} {opt.available !== undefined && `· Available: ${opt.available}`}
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                        {opt.currency || "₹"}{opt.pricePerDay.toLocaleString()}/day
                        {opt.taxes && opt.taxes > 0 && <span className="text-xs"> + taxes</span>}
                      </span>
                    </div>
                    {opt.description && (
                      <p className="text-sm leading-relaxed text-gray-700">{opt.description}</p>
                    )}
                    {opt.features?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">Features</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                          {opt.features.map((f) => (
                            <span key={f} className="rounded-full bg-gray-100 px-3 py-1">{f}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {opt.amenities && opt.amenities.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                          {opt.amenities.map((a) => (
                            <span key={a} className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{a}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <label className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm">
                      <span>Quantity</span>
                      <select
                        value={qty}
                        onChange={(e) => setQuantity((p) => ({ ...p, [key]: Number(e.target.value) }))}
                        className="rounded-lg border border-gray-200 px-3 py-1"
                      >
                        {Array.from(
                          { length: Math.min(6, Math.max(0, opt.available ?? 5)) + 1 },
                          (_, i) => i
                        ).map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </label>
                    <div className="text-xs text-gray-500">
                      {opt.isRefundable !== false ? (
                        <>Free cancellation up to {opt.refundableUntilHours ?? 48}h before</>
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

        {/* Booking Summary */}
        {pricing.selected.length > 0 && (
          <section className="mt-8 rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Booking summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({days} day{days > 1 ? "s" : ""})</span>
                <span>₹{pricing.subtotal.toLocaleString()}</span>
              </div>
              {pricing.taxes > 0 && (
                <div className="flex justify-between">
                  <span>Taxes & fees</span>
                  <span>₹{pricing.taxes.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base border-t border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span>₹{pricing.total.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handleBooking}
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Confirm Booking
            </button>
          </section>
        )}
      </main>

      {/* Gallery Modal */}
      {galleryOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <button onClick={() => setGalleryOpen(false)} className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-sm text-white">
            Close
          </button>
          <button onClick={() => setGalleryIdx((i) => (i - 1 + allImages.length) % allImages.length)} className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/30 p-3 text-white">
            <FaChevronLeft />
          </button>
          <div className="relative h-[70vh] w-full max-w-4xl overflow-hidden rounded-2xl">
            <Image src={allImages[galleryIdx]} alt="" fill className="object-contain" />
          </div>
          <button onClick={() => setGalleryIdx((i) => (i + 1) % allImages.length)} className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/30 p-3 text-white">
            <FaChevronRight />
          </button>
        </div>
      )}

      {/* Option Gallery */}
      {optionIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <button onClick={() => setOptionIdx(null)} className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-sm text-white">
            Close
          </button>
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold">{rental.options[optionIdx].model}</h3>
            <div className="relative mt-4 h-72 overflow-hidden rounded-2xl">
              <Image
                src={rental.options[optionIdx].images[optionImgIdx]}
                alt=""
                fill
                className="object-cover"
              />
              <button
                onClick={() => setOptionImgIdx((i) => (i - 1 + rental.options[optionIdx].images.length) % rental.options[optionIdx].images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => setOptionImgIdx((i) => (i + 1) % rental.options[optionIdx].images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
              >
                <FaChevronRight />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {rental.options[optionIdx].images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setOptionImgIdx(i)}
                  className={`relative h-20 overflow-hidden rounded-lg ${optionImgIdx === i ? "ring-2 ring-blue-500" : ""}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleRentalDetailClient;
