"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaMapMarkerAlt, FaSearch, FaUsers } from "react-icons/fa";
import { STAY_CATEGORIES, type StayCategoryValue } from "./categories";

export type Room = {
  name: string;
  bedType: string;
  beds: number;
  capacity: number;
  price: number;
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
  popularFacilities: string[];
  rooms: Room[];
  amenities: Record<string, string[]>;
};


type CategoryValue = StayCategoryValue;

type StaysExplorerProps = {
  initialCategory?: string;
};

const StayCard = ({ stay }: { stay: Stay }) => {
  const roomCount = stay.rooms?.length ?? 0;
  const startingPrice = roomCount
    ? Math.min(...stay.rooms.map((room) => room.price)).toLocaleString()
    : null;
  const heroHighlights = stay.heroHighlights?.slice(0, 3) ?? [];
  const primaryFeatures = stay.rooms?.[0]?.features?.slice(0, 4) ?? [];

  return (
    <Link
      href={`/stays/${stay._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-56 w-full">
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
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-green-700 shadow">
          {stay.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 text-gray-900">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{stay.name}</h3>
          <p className="mt-1 flex items-center text-sm text-gray-600">
            <FaMapMarkerAlt className="mr-2 text-green-600" />
            {stay.location.city}, {stay.location.state}
          </p>
        </div>

        {heroHighlights.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {heroHighlights.map((highlight) => (
              <span
                key={highlight}
                className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
              >
                {highlight}
              </span>
            ))}
          </div>
        )}

        {!!primaryFeatures.length && (
          <div className="text-xs text-gray-600">
            <span className="font-semibold text-gray-800">Room features:</span>{" "}
            {primaryFeatures.join(", ")}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
          <div className="text-gray-700">
            <span className="block font-semibold text-gray-900">
              {roomCount} room{roomCount === 1 ? "" : "s"}
            </span>
            {startingPrice ? (
              <span className="text-xs text-gray-500">From ₹{startingPrice} / night</span>
            ) : (
              <span className="text-xs text-gray-500">Pricing on request</span>
            )}
          </div>
          <span className="rounded-full bg-green-100 px-4 py-1 text-xs font-semibold text-green-700">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
};

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

  const filteredStays = useMemo(() => {
    return stays.filter((stay) => {
      if (activeCategory !== "all" && stay.category !== activeCategory) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = stay.name.toLowerCase().includes(term);
        const matchesCity = stay.location.city.toLowerCase().includes(term);
        const matchesHighlights = stay.heroHighlights?.some((highlight) =>
          highlight.toLowerCase().includes(term)
        );
        if (!matchesName && !matchesCity && !matchesHighlights) return false;
      }
      if (guests) {
        const hasRoom = stay.rooms?.some((room) => room.capacity >= guests);
        if (!hasRoom) return false;
      }
      return true;
    });
  }, [stays, activeCategory, searchTerm, guests]);

  return (
    <div className="min-h-screen bg-sky-50 text-black">
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
              onSubmit={(e) => {
                e.preventDefault();
              }}
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

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Curated stays just for you</h2>
            <p className="text-sm text-gray-600">
              Browse by category or use filters to narrow down the perfect match for your trip.
            </p>
          </div>
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
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          </div>
        ) : filteredStays.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white p-10 text-center shadow">
            <h3 className="text-lg font-semibold text-gray-900">No stays match your filters yet</h3>
            <p className="mt-2 text-sm text-gray-600">
              Try adjusting the guest count or remove some filters to explore more options.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredStays.map((stay) => (
              <StayCard key={stay._id} stay={stay} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
