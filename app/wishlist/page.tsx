//wishlist/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { StayCard, type Stay } from "../stays/StaysExplorer";
import { TourCard, type Tour } from "../tours/ToursExplorer";
import { AdventureCard, type Adventure } from "../adventures/AdventuresExplorer";
import { RentalCard, type VehicleRental } from "../vehicle-rental/vehiclerentalExplorer";
import { useWishlist } from "../hooks/useWishlist";
import PageLoader from "../components/common/PageLoader";

export default function WishlistPage() {
  const {
    wishlistEntries,
    wishlistIds,
    loading,
    error,
    wishlistLoaded,
    refresh,
    toggleWishlist,
  } = useWishlist<any>({ autoLoad: true });

  useEffect(() => {
    if (!wishlistLoaded && !loading) {
      refresh();
    }
  }, [wishlistLoaded, loading, refresh]);

  const handleToggleWishlist = (id: string, state?: boolean, serviceType?: string) => {
    toggleWishlist(id, state, serviceType as any);
  };

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      <section className="bg-linear-to-br from-green-600 via-green-500 to-lime-400 py-16 text-white">
        <div className="mx-auto max-w-5xl px-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Your wishlist</h1>
            <p className="mt-3 max-w-2xl text-white/80">
              Save your favourite stays, tours, adventures, and vehicle rentals and find them quickly whenever you are ready to book.
            </p>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <PageLoader />
        ) : wishlistEntries.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-900">Your wishlist is empty</h2>
            <p className="mt-2 text-sm text-gray-600">
              Tap the heart icon on any stay, tour, adventure, or vehicle rental to save it here for quick access later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {wishlistEntries.map((entry) => {
              const itemId = entry.stay?._id || entry.id;
              const isWishlisted = wishlistIds.has(itemId);
              const serviceType = entry.type || "stay";

              // Render Stay Card
              if (serviceType === "stay" && entry.stay) {
                return (
                  <StayCard
                    key={itemId}
                    stay={entry.stay as Stay}
                    isWishlisted={isWishlisted}
                    wishlistDisabled={false}
                    onToggleWishlist={(id, state) => handleToggleWishlist(id, state, "stay")}
                  />
                );
              }

              // Render Tour Card
              if (serviceType === "tour" && entry.stay) {
                return (
                  <TourCard
                    key={itemId}
                    tour={entry.stay as Tour}
                    isWishlisted={isWishlisted}
                    wishlistDisabled={false}
                    onToggleWishlist={(id, state) => handleToggleWishlist(id, state, "tour")}
                  />
                );
              }

              // Render Adventure Card
              if (serviceType === "adventure" && entry.stay) {
                return (
                  <AdventureCard
                    key={itemId}
                    adventure={entry.stay as Adventure}
                    isWishlisted={isWishlisted}
                    wishlistDisabled={false}
                    onToggleWishlist={(id, state) => handleToggleWishlist(id, state, "adventure")}
                  />
                );
              }

              // Render Vehicle Rental Card
              if (serviceType === "vehicle-rental" && entry.stay) {
                return (
                  <RentalCard
                    key={itemId}
                    rental={entry.stay as VehicleRental}
                    isWishlisted={isWishlisted}
                    wishlistDisabled={false}
                    onToggleWishlist={(id, state) => handleToggleWishlist(id, state, "vehicle-rental")}
                  />
                );
              }

              return null;
            })}
          </div>
        )}
      </section>
    </div>
  );
}
