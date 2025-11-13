//api/hook/useWishlist.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type WishlistEntry<TStay = any> = {
  id: string;
  stay: TStay;
  addedAt?: string;
  type?: string;
};

type UseWishlistOptions = {
  autoLoad?: boolean;
};

export function useWishlist<TStay = any>({ autoLoad = false }: UseWishlistOptions = {}) {
  const [entries, setEntries] = useState<WishlistEntry<TStay>[]>([]);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState<boolean>(false);

  const wishlistIds = useMemo(() => new Set(entries.map((entry) => (entry.stay as any)?._id || entry.id)), [entries]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wishlist", { credentials: "include" });
      if (res.status === 401) {
        setEntries([]);
        setError("You need to log in to use wishlist.");
        return;
      }
      if (!res.ok) {
        throw new Error((await res.json())?.message || "Failed to load wishlist");
      }
      const data = await res.json();
      const mapped: WishlistEntry<TStay>[] = Array.isArray(data?.wishlist)
        ? data.wishlist.map((item: any) => ({
            id: item.stay?._id || item._id,
            stay: item.stay ?? item,
            addedAt: item.addedAt,
            type: item.type, // Preserve type information
          }))
        : [];
      setEntries(mapped);
    } catch (err: any) {
      setError(err?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
      setLoadedOnce(true);
    }
  }, []);

  const addToWishlist = useCallback(async (serviceId: string, serviceType?: "stay" | "tour" | "adventure" | "vehicle-rental") => {
    setError(null);
    const optimistic = new Set(wishlistIds);
    if (optimistic.has(serviceId)) return;
    optimistic.add(serviceId);
    setEntries((prev) => [...prev, { id: serviceId, stay: { _id: serviceId } as any }]);
    try {
      // Determine which service type to send based on parameter or try to infer
      let body: any = {};
      if (serviceType === "tour") {
        body.tourId = serviceId;
      } else if (serviceType === "adventure") {
        body.adventureId = serviceId;
      } else if (serviceType === "vehicle-rental") {
        body.vehicleRentalId = serviceId;
      } else {
        // Default to stayId for backward compatibility
        body.stayId = serviceId;
      }

      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        throw new Error("Please log in to add favourites.");
      }
      if (!res.ok) {
        throw new Error((await res.json())?.message || "Failed to add to wishlist");
      }
      await refresh();
    } catch (err: any) {
      setEntries((prev) => prev.filter((entry) => ((entry.stay as any)?._id || entry.id) !== serviceId));
      setError(err?.message || "Failed to add to wishlist");
    }
  }, [refresh, wishlistIds]);

  const removeFromWishlist = useCallback(async (stayId: string) => {
    setError(null);
    const previous = entries;
    setEntries((prev) => prev.filter((entry) => ((entry.stay as any)?._id || entry.id) !== stayId));
    try {
      const res = await fetch(`/api/wishlist/${stayId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 401) {
        throw new Error("Please log in to manage favourites.");
      }
      if (!res.ok) {
        throw new Error((await res.json())?.message || "Failed to remove from wishlist");
      }
      await refresh();
    } catch (err: any) {
      setEntries(previous);
      setError(err?.message || "Failed to update wishlist");
    }
  }, [entries, refresh]);

  const toggleWishlist = useCallback(
    async (serviceId: string, nextState?: boolean, serviceType?: "stay" | "tour" | "adventure" | "vehicle-rental") => {
      const currentlyWishlisted = wishlistIds.has(serviceId);
      const shouldAdd = nextState !== undefined ? nextState : !currentlyWishlisted;
      if (shouldAdd) {
        await addToWishlist(serviceId, serviceType);
      } else {
        await removeFromWishlist(serviceId);
      }
    },
    [addToWishlist, removeFromWishlist, wishlistIds]
  );

  useEffect(() => {
    if (autoLoad) refresh();
  }, [autoLoad, refresh]);

  return {
    wishlistEntries: entries,
    wishlistIds,
    wishlistLoaded: loadedOnce,
    loading,
    error,
    refresh,
    toggleWishlist,
  };
}
