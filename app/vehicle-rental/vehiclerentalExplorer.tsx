// app/vehicle-rental/VehicleRentalExplorer.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaHeart,
  FaMapMarkerAlt,
  FaSearch,
  FaStar,
  FaCar,
  FaMotorcycle,
} from "react-icons/fa";
import { useWishlist } from "@/app/hooks/useWishlist";
import {
  VEHICLE_RENTAL_CATEGORIES,
  type VehicleRentalCategoryValue,
} from "./categories";

export type VehicleOption = {
  _id?: string;
  model: string;
  type: string;
  pricePerDay: number;
  features: string[];
  images: string[];
};

export type VehicleRental = {
  _id: string;
  name: string;
  category: "cars-rental" | "bikes-rentals";
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  images: string[];
  heroHighlights: string[];
  popularFacilities: string[];
  options: VehicleOption[];
  tags?: string[];
  rating?: { average: number; count: number };
};

type CategoryValue = VehicleRentalCategoryValue;

type VehicleRentalExplorerProps = {
  initialCategory?: string;
};

type RentalCardProps = {
  rental: VehicleRental;
  isWishlisted: boolean;
  wishlistDisabled: boolean;
  onToggleWishlist: (rentalId: string, nextState?: boolean, serviceType?: "stay" | "tour" | "adventure" | "vehicle-rental") => void;
  onSelectTag?: (tag: string) => void;
};

export const RentalCard = ({
  rental,
  isWishlisted,
  wishlistDisabled,
  onToggleWishlist,
  onSelectTag,
}: RentalCardProps) => {
  const optionCount = rental.options?.length ?? 0;
  const startingPrice = optionCount
    ? Math.min(...rental.options.map((opt) => opt.pricePerDay)).toLocaleString()
    : null;
  const heroHighlights = rental.heroHighlights?.slice(0, 3) ?? [];
  const primaryFeatures = rental.options?.[0]?.features?.slice(0, 4) ?? [];
  const ratingValue = rental.rating?.count ? rental.rating.average : null;
  const tags = rental.tags ?? [];

  return (
    <Link
      href={`/vehicle-rental/${rental._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-56 w-full">
        <button
          type="button"
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!wishlistDisabled) onToggleWishlist(rental._id, !isWishlisted, "vehicle-rental");
          }}
          disabled={wishlistDisabled}
          className={`absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow transition hover:scale-105 ${
            wishlistDisabled ? "cursor-not-allowed opacity-60" : ""
          }`}
        >
          <FaHeart className={`text-lg ${isWishlisted ? "text-red-500" : "text-gray-300"}`} />
        </button>

        {rental.images?.[0] ? (
          <Image
            src={rental.images[0]}
            alt={rental.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
            No image
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-blue-700 shadow">
          {rental.category === "cars-rental" ? "Car" : "Bike"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 text-gray-900">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{rental.name}</h3>
            <p className="mt-1 flex items-center text-sm text-gray-600">
              <FaMapMarkerAlt className="mr-2 text-blue-600" />
              {rental.location.city}, {rental.location.state}
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
            {heroHighlights.map((h) => (
              <span
                key={h}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {h}
              </span>
            ))}
          </div>
        )}

        {!!primaryFeatures.length && (
          <div className="text-xs text-gray-600">
            <span className="font-semibold text-gray-800">Features:</span>{" "}
            {primaryFeatures.join(", ")}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectTag?.(tag);
                }}
                className="rounded-full border border-blue-200 px-3 py-1 text-blue-700 transition hover:border-blue-400 hover:bg-blue-50"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
          <div className="text-gray-700">
            <span className="block font-semibold text-gray-900">
              {optionCount} vehicle{optionCount === 1 ? "" : "s"}
            </span>
            {startingPrice ? (
              <span className="text-xs text-gray-500">From ₹{startingPrice}/day</span>
            ) : (
              <span className="text-xs text-gray-500">Pricing on request</span>
            )}
          </div>
          <span className="rounded-full bg-blue-100 px-4 py-1 text-xs font-semibold text-blue-700">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
};

export default function VehicleRentalExplorer({ initialCategory = "all" }: VehicleRentalExplorerProps) {
  const normalizedInitialCategory: CategoryValue = VEHICLE_RENTAL_CATEGORIES.some(
    (tab) => tab.value === initialCategory
  )
    ? (initialCategory as CategoryValue)
    : "all";

  const [rentals, setRentals] = useState<VehicleRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryValue>(normalizedInitialCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");
  const [ratingFilter, setRatingFilter] = useState<number | "">("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { wishlistEntries, wishlistIds, isInWishlist, wishlistLoaded, toggleWishlist, error: wishlistError } =
    useWishlist<{ _id: string }>({ autoLoad: true });

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    rentals.forEach((r) => (r.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [rentals]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/vehicle-rentals?all=true", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data?.message || "Failed");
        setRentals(data.rentals || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load rentals");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setActiveCategory(normalizedInitialCategory);
  }, [normalizedInitialCategory]);

  const priceBounds = useMemo(() => {
    if (!rentals.length) return { min: 0, max: 0 };
    const prices = rentals
      .map((r) => (r.options?.length ? Math.min(...r.options.map((o) => o.pricePerDay)) : null))
      .filter((p): p is number => typeof p === "number");
    return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : { min: 0, max: 0 };
  }, [rentals]);

  useEffect(() => {
    setPriceMin(priceBounds.min);
    setPriceMax(priceBounds.max);
  }, [priceBounds]);

  const filteredRentals = useMemo(() => {
    return rentals.filter((r) => {
      if (activeCategory !== "all" && r.category !== activeCategory) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !r.name.toLowerCase().includes(term) &&
          !r.location.city.toLowerCase().includes(term) &&
          !r.heroHighlights?.some((h) => h.toLowerCase().includes(term))
        )
          return false;
      }
      const minPrice = r.options?.length ? Math.min(...r.options.map((o) => o.pricePerDay)) : null;
      if (priceMin !== "" && minPrice !== null && minPrice < priceMin) return false;
      if (priceMax !== "" && minPrice !== null && minPrice > priceMax) return false;
      if (ratingFilter !== "" && r.rating?.average !== undefined && r.rating.average < ratingFilter) return false;
      if (selectedTags.length && !(r.tags || []).some((t) => selectedTags.includes(t))) return false;
      return true;
    });
  }, [rentals, activeCategory, searchTerm, priceMin, priceMax, ratingFilter, selectedTags]);

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 py-16 text-white">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold sm:text-4xl">Rent your ride</h1>
            <p className="mt-3 text-base text-white/80">
              Cars, bikes, and more — verified rentals with transparent pricing.
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl">
            <form
              className="grid grid-cols-1 gap-4 text-gray-900 sm:grid-cols-2 lg:grid-cols-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Location</label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-blue-500">
                  <FaSearch className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="City, rental name, highlight"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Filters + Listings */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Available rentals</h2>
            <p className="text-sm text-gray-600">Filter by category, price, or tags.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {VEHICLE_RENTAL_CATEGORIES.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveCategory(tab.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeCategory === tab.value
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white text-gray-700 shadow-sm hover:bg-blue-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Price per day (₹)</label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                min={0}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                placeholder={priceBounds.min.toString()}
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                min={0}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                placeholder={priceBounds.max.toString()}
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Min rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-2 w-40 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500"
            >
              <option value="">All</option>
              {[5, 4, 3].map((v) => (
                <option key={v} value={v}>
                  {v}+ stars
                </option>
              ))}
            </select>
          </div>

          {availableTags.length > 0 && (
            <div className="flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Tags</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setSelectedTags((p) => (p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]))
                      }
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        active
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {wishlistError && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            {wishlistError}
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white p-10 text-center shadow">
            <h3 className="text-lg font-semibold text-gray-900">No rentals match your filters</h3>
            <p className="mt-2 text-sm text-gray-600">Try adjusting filters.</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredRentals.map((rental) => (
              <RentalCard
                key={rental._id}
                rental={rental}
                isWishlisted={isInWishlist(rental._id)}
                wishlistDisabled={!wishlistLoaded}
                onToggleWishlist={(id, state) => toggleWishlist(id, state, "vehicle-rental")}
                onSelectTag={(tag) => setSelectedTags((p) => (p.includes(tag) ? p : [...p, tag]))}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}