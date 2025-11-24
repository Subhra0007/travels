"use client";

import PageLoader from "../../components/common/PageLoader";
import { useWishlist } from "../../hooks/useWishlist";
import { AdventureCard, type Adventure } from "../../adventures/AdventuresExplorer";
import { StayCard, type Stay } from "../../stays/StaysExplorer";
import { TourCard, type Tour } from "../../tours/ToursExplorer";
import { RentalCard, type VehicleRental } from "../../vehicle-rental/vehiclerentalExplorer";
import { useProfileLayout } from "../ProfileLayoutContext";

export default function ProfileWishlistPage() {
  const { user } = useProfileLayout();
  const {
    wishlistEntries,
    wishlistIds,
    loading,
    error,
    wishlistLoaded,
    toggleWishlist,
  } = useWishlist<any>({ autoLoad: true });

  const handleToggleWishlist = (
    id: string,
    state: boolean | undefined,
    type: "stay" | "tour" | "adventure" | "vehicle-rental"
  ) => {
    toggleWishlist(id, state, type);
  };

  const isLoading = loading || !wishlistLoaded;

  const firstName = user?.fullName?.split(" ")[0] ?? "traveler";

  return (
    <div className="space-y-6 pt-15">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">Wishlist</h1>
        <p className="text-gray-500 mt-2">
          {firstName}, quickly revisit the stays, tours, adventures, and rentals you have saved.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <PageLoader fullscreen={false} className="py-12" />
      ) : wishlistEntries.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow">
          <h2 className="text-xl font-semibold text-gray-900">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-gray-600">
            Tap the heart icon on any experience to save it here for later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {wishlistEntries.map((entry) => {
            const entryId = entry.stay?._id || entry.id;
            const isWishlisted = wishlistIds.has(entryId);
            const serviceType = entry.type || "stay";

            if (serviceType === "stay" && entry.stay) {
              return (
                <StayCard
                  key={entryId}
                  stay={entry.stay as Stay}
                  isWishlisted={isWishlisted}
                  wishlistDisabled={false}
                  onToggleWishlist={(id, state) => handleToggleWishlist(id, state, "stay")}
                />
              );
            }

            if (serviceType === "tour" && entry.stay) {
              return (
                <TourCard
                  key={entryId}
                  tour={entry.stay as Tour}
                  isWishlisted={isWishlisted}
                  wishlistDisabled={false}
                  onToggleWishlist={(id, state) => handleToggleWishlist(id, state, "tour")}
                />
              );
            }

            if (serviceType === "adventure" && entry.stay) {
              return (
                <AdventureCard
                  key={entryId}
                  adventure={entry.stay as Adventure}
                  isWishlisted={isWishlisted}
                  wishlistDisabled={false}
                  onToggleWishlist={(id, state) => handleToggleWishlist(id, state, "adventure")}
                />
              );
            }

            if (serviceType === "vehicle-rental" && entry.stay) {
              return (
                <RentalCard
                  key={entryId}
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
    </div>
  );
}

