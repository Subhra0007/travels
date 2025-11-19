// adventures/AdventuresExplorer.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaHeart,
  FaMapMarkerAlt,
  FaSearch,
  FaStar,
  FaUsers,
  FaClock,
  FaMountain,
} from "react-icons/fa";
import { useWishlist } from "../hooks/useWishlist";
import { ADVENTURE_CATEGORIES, type AdventureCategoryValue } from "./categories";

export type AdventureOption = {
  _id?: string;
  name: string;
  duration: string;
  difficulty: string;
  capacity: number;
  price: number;
  taxes?: number;
  features: string[];
  images: string[];
};

export type Adventure = {
  _id: string;
  name: string;
  category: "trekking" | "hiking" | "camping" | "water-rafting";
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
  options: AdventureOption[];
  amenities: Record<string, string[]>;
  rating?: { average: number; count: number };
  tags?: string[];
};

type CategoryValue = AdventureCategoryValue;

type AdventuresExplorerProps = {
  initialCategory?: string;
};

type AdventureCardProps = {
  adventure: Adventure;
  isWishlisted: boolean;
  wishlistDisabled: boolean;
  onToggleWishlist: (advId: string, nextState?: boolean, serviceType?: "stay" | "tour" | "adventure" | "vehicle-rental") => void;
  onSelectTag?: (tag: string) => void;
};

export const AdventureCard = ({
  adventure,
  isWishlisted,
  wishlistDisabled,
  onToggleWishlist,
  onSelectTag,
}: AdventureCardProps) => {
  const optionCount = adventure.options?.length ?? 0;
  const startingPrice = optionCount
    ? Math.min(...adventure.options.map((o) => o.price)).toLocaleString()
    : null;
  const heroHighlights = adventure.heroHighlights?.slice(0, 3) ?? [];
  const primaryFeatures = adventure.options?.[0]?.features?.slice(0, 4) ?? [];
  const ratingValue = adventure.rating?.count ? adventure.rating.average : null;
  const tags = adventure.tags ?? [];

  return (
    <Link
      href={`/adventures/${adventure._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-56 w-full">
        <button
          type="button"
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!wishlistDisabled) onToggleWishlist(adventure._id, !isWishlisted, "adventure");
          }}
          disabled={wishlistDisabled}
          className={`absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow transition hover:scale-105 ${
            wishlistDisabled ? "cursor-not-allowed opacity-60" : ""
          }`}
        >
          <FaHeart className={`text-lg ${isWishlisted ? "text-red-500" : "text-gray-300"}`} />
        </button>

        {adventure.images?.length ? (
          <Image
            src={adventure.images[0]}
            alt={adventure.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
            No image
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-orange-700 shadow">
          {adventure.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 text-gray-900">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{adventure.name}</h3>
            <p className="mt-1 flex items-center text-sm text-gray-600">
              <FaMapMarkerAlt className="mr-2 text-orange-600" />
              {adventure.location.city}, {adventure.location.state}
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
                className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
              >
                {h}
              </span>
            ))}
          </div>
        )}

        {!!primaryFeatures.length && (
          <div className="text-xs text-gray-600">
            <span className="font-semibold text-gray-800">Option features:</span>{" "}
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
                className="rounded-full border border-orange-200 px-3 py-1 text-orange-700 transition hover:border-orange-400 hover:bg-orange-50"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
          <div className="text-gray-700">
            <span className="block font-semibold text-gray-900">
              {optionCount} option{optionCount === 1 ? "" : "s"}
            </span>
            {startingPrice ? (
              <span className="text-xs text-gray-500">From ₹{startingPrice}</span>
            ) : (
              <span className="text-xs text-gray-500">Pricing on request</span>
            )}
          </div>
          <span className="rounded-full bg-orange-100 px-4 py-1 text-xs font-semibold text-orange-700">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
};

export default function AdventuresExplorer({ initialCategory = "all" }: AdventuresExplorerProps) {
  const params = useSearchParams();
  const categoryParam = params.get("category") || initialCategory;
  const normalizedInitialCategory: CategoryValue = ADVENTURE_CATEGORIES.some(
    (tab) => tab.value === categoryParam
  )
    ? (categoryParam as CategoryValue)
    : "all";

  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryValue>(normalizedInitialCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");
  const [ratingFilter, setRatingFilter] = useState<number | "">("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");

  const { wishlistEntries, wishlistIds, isInWishlist, wishlistLoaded, toggleWishlist, error: wishlistError } =
    useWishlist<{ _id: string }>({ autoLoad: true });

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    adventures.forEach((adv) => (adv.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [adventures]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/vendor/adventures?all=true", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data?.message || "Failed");
        setAdventures(data.adventures || []);
      } catch (err: any) {
        setError(err?.message || "Unable to load adventures");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const priceBounds = useMemo(() => {
    if (!adventures.length) return { min: 0, max: 0 };
    const prices = adventures
      .map((adv) =>
        adv.options?.length ? Math.min(...adv.options.map((o) => o.price)) : null
      )
      .filter((p): p is number => typeof p === "number");
    if (!prices.length) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [adventures]);

  useEffect(() => {
    setPriceMin(priceBounds.min);
    setPriceMax(priceBounds.max);
  }, [priceBounds.min, priceBounds.max]);

  const filteredAdventures = useMemo(() => {
    return adventures.filter((adv) => {
      if (activeCategory !== "all" && adv.category !== activeCategory) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = adv.name.toLowerCase().includes(term);
        const matchesCity = adv.location.city.toLowerCase().includes(term);
        const matchesHighlight = adv.heroHighlights?.some((h) => h.toLowerCase().includes(term));
        if (!matchesName && !matchesCity && !matchesHighlight) return false;
      }
      if (guests) {
        const ok = adv.options?.some((o) => o.capacity >= guests);
        if (!ok) return false;
      }
      const minPrice = adv.options?.length
        ? Math.min(...adv.options.map((o) => o.price))
        : null;
      if (priceMin !== "" && typeof minPrice === "number" && minPrice < priceMin) return false;
      if (priceMax !== "" && typeof minPrice === "number" && minPrice > priceMax) return false;
      if (ratingFilter !== "" && adv.rating?.average !== undefined) {
        if ((adv.rating?.count ?? 0) === 0 || adv.rating.average < ratingFilter) return false;
      }
      if (difficultyFilter) {
        const ok = adv.options?.some((o) => o.difficulty === difficultyFilter);
        if (!ok) return false;
      }
      if (selectedTags.length) {
        const advTags = adv.tags || [];
        if (!selectedTags.every((t) => advTags.includes(t))) return false;
      }
      return true;
    });
  }, [
    adventures,
    activeCategory,
    searchTerm,
    guests,
    priceMin,
    priceMax,
    ratingFilter,
    difficultyFilter,
    selectedTags,
  ]);

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      {/* Hero + Search */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 py-16 text-white">
      
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold sm:text-4xl">Discover thrilling adventures</h1>
            <p className="mt-3 text-base text-white/80">
              Hand-picked treks, hikes, camps & rafting experiences with live availability.
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl">
            <form
              className="grid grid-cols-1 gap-4 text-gray-900 sm:grid-cols-2 lg:grid-cols-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Search</label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-orange-500">
                  <FaSearch className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="City, name, highlight"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent outline-none placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Participants</label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-orange-500">
                  <FaUsers className="text-gray-500" />
                  <input
                    type="number"
                    min={1}
                    value={guests}
                    onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Difficulty</label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:border-orange-500 focus:outline-none"
                >
                  <option value="">All levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Challenging">Challenging</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Category</label>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value as CategoryValue)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:border-orange-500 focus:outline-none"
                >
                  {ADVENTURE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Filters + List */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Choose your adventure</h2>
            <p className="text-sm text-gray-600">
              Use filters below to narrow down the perfect experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ADVENTURE_CATEGORIES.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveCategory(tab.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeCategory === tab.value
                    ? "bg-orange-600 text-white shadow"
                    : "bg-white text-gray-700 shadow-sm hover:bg-orange-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 rounded-2xl bg-white p-4 shadow-sm">
          {/* Price */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Price (₹)
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                min={0}
                value={priceMin === "" ? "" : priceMin}
                onChange={(e) => setPriceMin(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                placeholder={priceBounds.min.toString()}
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                min={0}
                value={priceMax === "" ? "" : priceMax}
                onChange={(e) => setPriceMax(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                placeholder={priceBounds.max.toString()}
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Minimum rating
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-2 w-40 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            >
              <option value="">All</option>
              {[5, 4, 3].map((n) => (
                <option key={n} value={n}>
                  {n}+ stars
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Tags
              </label>
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
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 text-gray-600 hover:border-orange-400 hover:bg-orange-50"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full border border-orange-500 px-3 py-1 text-xs font-semibold text-orange-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                    className="text-orange-600 hover:text-orange-800"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {wishlistError && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            {wishlistError}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : filteredAdventures.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white p-10 text-center shadow">
            <h3 className="text-lg font-semibold text-gray-900">No adventures match your filters</h3>
            <p className="mt-2 text-sm text-gray-600">
              Try adjusting the filters or search term.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredAdventures.map((adv) => (
              <AdventureCard
                key={adv._id}
                adventure={adv}
                isWishlisted={isInWishlist(adv._id)}
                wishlistDisabled={!wishlistLoaded}
                onToggleWishlist={(id, state) => toggleWishlist(id, state, "adventure")}
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