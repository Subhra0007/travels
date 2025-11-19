// Stays/Explorer.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaBath,
  FaBolt,
  FaCoffee,
  FaDumbbell,
  FaHeart,
  FaMapMarkerAlt,
  FaParking,
  FaSearch,
  FaSnowflake,
  FaStar,
  FaSwimmingPool,
  FaUsers,
  FaWifi,
  FaUtensils,
  FaCheckCircle,
  FaBed,
} from "react-icons/fa";
import { STAY_CATEGORIES, type StayCategoryValue } from "./categories";
import { useWishlist } from "../hooks/useWishlist";

export type Room = {
  _id?: string;
  name: string;
  bedType: string;
  beds: number;
  capacity: number;
  price: number;
  taxes?: number;
  amenities?: string[];
  size?: string;
  features: string[];
  images: string[];
};

export type Stay = {
  _id: string;
  name: string;
  category: "rooms" | "hotels" | "homestays" | "bnbs";
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  images: string[];
  heroHighlights: string[];
  curatedHighlights?: Array<{ title: string; description?: string; icon?: string }>;
  popularFacilities: string[];
  rooms: Room[];
  amenities: Record<string, string[]>;
  rating?: { average: number; count: number };
  tags?: string[];
};

type CategoryValue = StayCategoryValue;

type StaysExplorerProps = {
  initialCategory?: string;
};

type StayCardProps = {
  stay: Stay;
  isWishlisted: boolean;
  wishlistDisabled: boolean;
  onToggleWishlist: (stayId: string, nextState?: boolean, serviceType?: "stay" | "tour" | "adventure" | "vehicle-rental") => void;
  onSelectTag?: (tag: string) => void;
};

const facilityIconLookup = [
  { keywords: ["wifi", "internet"], icon: <FaWifi className="text-green-600" /> },
  { keywords: ["breakfast", "dining", "restaurant"], icon: <FaCoffee className="text-amber-500" /> },
  { keywords: ["parking", "garage"], icon: <FaParking className="text-blue-500" /> },
  { keywords: ["pool", "swim"], icon: <FaSwimmingPool className="text-cyan-500" /> },
  { keywords: ["ac", "air", "climate"], icon: <FaSnowflake className="text-sky-500" /> },
  { keywords: ["gym", "fitness"], icon: <FaDumbbell className="text-purple-500" /> },
  { keywords: ["spa", "bath"], icon: <FaBath className="text-rose-500" /> },
  { keywords: ["power", "generator"], icon: <FaBolt className="text-yellow-500" /> },
  { keywords: ["dining", "food"], icon: <FaUtensils className="text-orange-500" /> },
];

const getFacilityIcon = (label: string) => {
  const normalized = label?.toLowerCase() || "";
  const match = facilityIconLookup.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword))
  );
  return match?.icon ?? <FaCheckCircle className="text-green-500" />;
};

export const StayCard = ({
  stay,
  isWishlisted,
  wishlistDisabled,
  onToggleWishlist,
  onSelectTag,
}: StayCardProps) => {
  const roomCount = stay.rooms?.length ?? 0;
  const startingPrice = roomCount
    ? Math.min(...stay.rooms.map((room) => room.price)).toLocaleString()
    : null;
  const heroHighlights = stay.heroHighlights?.slice(0, 3) ?? [];
  const primaryFeatures = stay.rooms?.[0]?.features?.slice(0, 4) ?? [];
  const ratingValue = stay.rating?.count ? stay.rating.average : null;
  const tags = stay.tags ?? [];

  return (
    <Link
      href={`/stays/${stay._id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/95 shadow-xl backdrop-blur-sm transition hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className="relative h-56 w-full">
        <button
          type="button"
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!wishlistDisabled) {
              onToggleWishlist(stay._id, !isWishlisted, "stay");
            }
          }}
          disabled={wishlistDisabled}
          className={`absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow transition hover:scale-105 ${
            wishlistDisabled ? "cursor-not-allowed opacity-60" : ""
          }`}
        >
          <FaHeart className={`text-lg ${isWishlisted ? "text-red-500" : "text-gray-300"}`} />
        </button>

        {stay.images && stay.images.length ? (
          <Image
            src={stay.images[0]}
            alt={stay.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-green-700 shadow">
          {stay.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6 text-gray-900">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{stay.name}</h3>
            <p className="mt-1 flex items-center text-sm text-gray-600">
              <FaMapMarkerAlt className="mr-2 text-green-600" />
              {stay.location.city}, {stay.location.state}
            </p>
          </div>
          {ratingValue !== null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
              <FaStar className="text-yellow-500" /> {ratingValue.toFixed(1)}
            </span>
          )}
        </div>

        {heroHighlights.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {heroHighlights.map((highlight) => (
              <span
                key={highlight}
                className="rounded-full bg-green-50/80 px-3 py-1 text-xs font-medium text-green-700"
              >
                {highlight}
              </span>
            ))}
          </div>
        )}

        {!!primaryFeatures.length && (
          <div className="rounded-2xl border border-green-50 bg-green-50/60 px-4 py-3 text-xs text-gray-700 shadow-inner">
            <span className="font-semibold text-gray-900">Room features:</span>{" "}
            {primaryFeatures.join(", ")}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onSelectTag?.(tag);
                }}
                className="rounded-full border border-green-200/70 bg-white px-3 py-1 text-green-700 shadow-sm transition hover:border-green-400 hover:bg-green-50"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {stay.popularFacilities?.length ? (
          <div className="flex flex-wrap gap-2">
            {stay.popularFacilities.slice(0, 4).map((facility) => (
              <span
                key={facility}
                className="inline-flex items-center gap-2 rounded-2xl border border-green-100 bg-white/80 px-3 py-2 text-xs text-gray-700 shadow-sm"
              >
                {getFacilityIcon(facility)}
                <span className="font-medium capitalize">{facility}</span>
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
          <div className="flex flex-1 flex-wrap gap-3 text-xs text-gray-600">
            <div className="flex flex-1 min-w-[120px] items-center gap-2 rounded-2xl bg-green-50/80 px-3 py-2">
              <FaBed className="text-green-600" />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-green-700">Rooms</p>
                <p className="text-sm font-semibold text-gray-900">{roomCount}</p>
              </div>
            </div>
            <div className="flex flex-1 min-w-[120px] items-center gap-2 rounded-2xl bg-green-50/80 px-3 py-2">
              <FaUsers className="text-green-600" />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-green-700">Max guests</p>
                <p className="text-sm font-semibold text-gray-900">
                  {stay.rooms?.[0]?.capacity ?? guestsFallback(stay)}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            {startingPrice ? (
              <>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Starting at</p>
                <p className="text-lg font-semibold text-green-700">₹{startingPrice}</p>
                <p className="text-[11px] text-gray-400">per night</p>
              </>
            ) : (
              <p className="text-xs text-gray-500">Pricing on request</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

const guestsFallback = (stay: Stay) => stay.rooms?.reduce((max, room) => Math.max(max, room.capacity), 0) ?? 2;

export default function StaysExplorer({ initialCategory = "all" }: StaysExplorerProps) {
  const normalizedInitialCategory: CategoryValue = STAY_CATEGORIES.some(
    (tab) => tab.value === initialCategory
  )
    ? (initialCategory as CategoryValue)
    : "all";

  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryValue>(normalizedInitialCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [guests, setGuests] = useState(2);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");
  const [ratingFilter, setRatingFilter] = useState<number | "">("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // NEW: Sorting state
  const [sortBy, setSortBy] = useState<
    "rating-desc" | "price-asc" | "price-desc" | "location-asc"
  >("rating-desc");

  const { wishlistEntries, wishlistIds, isInWishlist, wishlistLoaded, toggleWishlist, error: wishlistError } =
    useWishlist<{ _id: string }>({ autoLoad: true });

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    stays.forEach((stay) => {
      (stay.tags || []).forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [stays]);

  useEffect(() => {
    const loadStays = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/vendor/stays?all=true", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data?.message || "Failed to load stays");
        }
        setStays(data.stays || []);
      } catch (err: any) {
        setError(err?.message || "Unable to load stays right now");
      } finally {
        setLoading(false);
      }
    };

    loadStays();
  }, []);

  useEffect(() => {
    setActiveCategory(normalizedInitialCategory);
  }, [normalizedInitialCategory]);

  const priceBounds = useMemo(() => {
    if (!stays.length) return { min: 0, max: 0 };
    const prices = stays
      .map((stay) => (stay.rooms?.length ? Math.min(...stay.rooms.map((room) => room.price)) : null))
      .filter((price): price is number => typeof price === "number" && !Number.isNaN(price));
    if (!prices.length) return { min: 0, max: 0 };
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [stays]);

  useEffect(() => {
    if (priceBounds.min === 0 && priceBounds.max === 0) {
      setPriceMin("");
      setPriceMax("");
      return;
    }
    setPriceMin(priceBounds.min);
    setPriceMax(priceBounds.max);
  }, [priceBounds.min, priceBounds.max]);

  // COMBINED: Sorting + Filtering
  const sortedAndFilteredStays = useMemo(() => {
    let result = [...stays];

    // ─── SORTING ───
    result.sort((a, b) => {
      switch (sortBy) {
        case "rating-desc": {
          const ratingA = a.rating?.average ?? 0;
          const ratingB = b.rating?.average ?? 0;
          if (ratingB !== ratingA) return ratingB - ratingA;
          return (b.rating?.count ?? 0) - (a.rating?.count ?? 0);
        }
        case "price-asc": {
          const priceA = a.rooms?.length ? Math.min(...a.rooms.map(r => r.price)) : Infinity;
          const priceB = b.rooms?.length ? Math.min(...b.rooms.map(r => r.price)) : Infinity;
          return priceA - priceB;
        }
        case "price-desc": {
          const priceA = a.rooms?.length ? Math.min(...a.rooms.map(r => r.price)) : -Infinity;
          const priceB = b.rooms?.length ? Math.min(...b.rooms.map(r => r.price)) : -Infinity;
          return priceB - priceA;
        }
        case "location-asc": {
          const locA = `${a.location.city}, ${a.location.state}`.toLowerCase();
          const locB = `${b.location.city}, ${b.location.state}`.toLowerCase();
          return locA.localeCompare(locB);
        }
        default:
          return 0;
      }
    });

    // ─── FILTERING ───
    return result.filter((stay) => {
      if (activeCategory !== "all" && stay.category !== activeCategory) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = stay.name.toLowerCase().includes(term);
        const matchesCity = stay.location.city.toLowerCase().includes(term);
        const matchesHighlights = stay.heroHighlights?.some((h) => h.toLowerCase().includes(term));
        if (!matchesName && !matchesCity && !matchesHighlights) return false;
      }

      if (guests) {
        const hasRoom = stay.rooms?.some((room) => room.capacity >= guests);
        if (!hasRoom) return false;
      }

      const minStayPrice = stay.rooms?.length
        ? Math.min(...stay.rooms.map((room) => room.price))
        : null;

      if (priceMin !== "" && typeof minStayPrice === "number" && minStayPrice < priceMin) return false;
      if (priceMax !== "" && typeof minStayPrice === "number" && minStayPrice > priceMax) return false;

      if (ratingFilter !== "" && typeof stay.rating?.average === "number") {
        if ((stay.rating?.count ?? 0) === 0 || stay.rating.average < ratingFilter) return false;
      }

      if (selectedTags.length) {
        const stayTags = stay.tags || [];
        if (!selectedTags.every((tag) => stayTags.includes(tag))) return false;
      }

      return true;
    });
  }, [
    stays,
    activeCategory,
    searchTerm,
    guests,
    priceMin,
    priceMax,
    ratingFilter,
    selectedTags,
    sortBy,
  ]);

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-green-600 via-green-500 to-lime-400 py-16 text-white">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold sm:text-4xl">Find your perfect stay</h1>
            <p className="mt-3 text-base text-white/80">
              Explore handpicked rooms, hotels, homestays, and cosy BnBs with verified amenities and
              detailed room insights—just like your favourite booking websites.
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl">
            <form
              className="grid grid-cols-1 gap-4 text-gray-900 sm:grid-cols-2 lg:grid-cols-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Destination</label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-green-500">
                  <FaSearch className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="City, hotel name, highlight"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Guests</label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-green-500">
                  <FaUsers className="text-gray-500" />
                  <input
                    type="number"
                    min={1}
                    value={guests}
                    onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-transparent text-gray-900 outline-none"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Curated stays just for you</h2>
            <p className="text-sm text-gray-600">
              Browse by category or use filters to narrow down the perfect match for your trip.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {STAY_CATEGORIES.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveCategory(tab.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeCategory === tab.value
                      ? "bg-green-600 text-white shadow"
                      : "bg-white text-gray-700 shadow-sm hover:bg-green-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* NEW: Sort Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 focus:border-green-500 focus:outline-none cursor-pointer"
              >
                <option value="rating-desc">Highest Rating</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="location-asc">Location (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mt-6 flex flex-wrap gap-6 rounded-2xl bg-white p-5 shadow-sm">
          {/* Price Range */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Price range (₹)</label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                min={0}
                value={priceMin === "" ? "" : priceMin}
                onChange={(e) => setPriceMin(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                placeholder={priceBounds.min.toString()}
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                min={0}
                value={priceMax === "" ? "" : priceMax}
                onChange={(e) => setPriceMax(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                placeholder={priceBounds.max.toString()}
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Minimum rating</label>
            <select
              value={ratingFilter === "" ? "" : ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-2 w-44 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            >
              <option value="">All ratings</option>
              {[9, 8, 7, 6, 5].map((n) => (
                <option key={n} value={n}>
                  {n}+ Very good
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Popular tags</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setSelectedTags((prev) =>
                          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                        )
                      }
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        active
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Tag Pills */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full border border-green-500 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setSelectedTags((prev) => prev.filter((t) => t !== tag))}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Errors */}
        {wishlistError && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            {wishlistError}
          </div>
        )}
        {/* Results */}
        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          </div>
        ) : sortedAndFilteredStays.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white p-10 text-center shadow">
            <h3 className="text-lg font-semibold text-gray-900">No stays match your filters yet</h3>
            <p className="mt-2 text-sm text-gray-600">
              Try adjusting the guest count or remove some filters to explore more options.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sortedAndFilteredStays.map((stay) => (
              <StayCard
                key={stay._id}
                stay={stay}
                isWishlisted={wishlistIds.has(stay._id)}
                wishlistDisabled={!wishlistLoaded}
                onToggleWishlist={toggleWishlist}
                onSelectTag={(tag) =>
                  setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]))
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}