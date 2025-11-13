//wishlist/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { StayCard, type Stay } from "../stays/StaysExplorer";
import { TourCard, type Tour } from "../tours/ToursExplorer";
import { AdventureCard, type Adventure } from "../adventures/AdventuresExplorer";
import { RentalCard, type VehicleRental } from "../vehicle-rental/vehiclerentalExplorer";
import { useWishlist } from "../hooks/useWishlist";

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
        <div className="mx-auto max-w-5xl px-6">
          <h1 className="text-3xl font-bold sm:text-4xl">Your wishlist</h1>
          <p className="mt-3 max-w-2xl text-white/80">
            Save your favourite stays, tours, adventures, and vehicle rentals and find them quickly whenever you are ready to book.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          </div>
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
