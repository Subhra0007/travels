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

  const wishlistIds = useMemo(() => {
    const ids = entries.map((entry) => {
      // Try multiple ways to extract the service ID
      // Priority: entry.stay._id > entry.stay.id > entry.id
      const serviceId = (entry.stay as any)?._id || (entry.stay as any)?.id || entry.id;
      return serviceId ? String(serviceId) : null;
    }).filter(Boolean) as string[];
    return new Set(ids);
  }, [entries]);

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
        ? data.wishlist.map((item: any) => {
            // Extract service ID from the stay object (which could be stay, tour, adventure, or vehicle)
            // item.stay contains the actual service object with _id
            // item._id is the wishlist document ID, NOT the service ID
            const serviceId = item.stay?._id || item.stay?.id;
            if (!serviceId) {
              console.warn("Wishlist item missing service ID:", item);
            }
            return {
              id: serviceId ? String(serviceId) : String(item._id || ""),
              stay: item.stay ?? item,
              addedAt: item.addedAt,
              type: item.type, // Preserve type information
            };
          })
        : [];
      setEntries(mapped);
    } catch (err: any) {
      setError(err?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
      setLoadedOnce(true);
    }
  }, []);

  // Helper function to check if an ID is in the wishlist (normalizes the ID)
  // Defined early so it can be used by addToWishlist and removeFromWishlist
  const isInWishlist = useCallback((id: string | any) => {
    if (!id) return false;
    const normalizedId = String(id);
    // Check both the Set and also directly in entries as a fallback
    if (wishlistIds.has(normalizedId)) return true;
    // Fallback: check entries directly with multiple ID extraction methods
    return entries.some((entry) => {
      // Try to extract service ID from entry.stay first (most reliable)
      const entryId = (entry.stay as any)?._id || (entry.stay as any)?.id || entry.id;
      return String(entryId) === normalizedId;
    });
  }, [wishlistIds, entries]);

  const addToWishlist = useCallback(async (serviceId: string, serviceType?: "stay" | "tour" | "adventure" | "vehicle-rental") => {
    setError(null);
    const normalizedId = String(serviceId);
    
    // Check if already in wishlist using isInWishlist for consistency
    const currentlyInWishlist = isInWishlist(normalizedId);
    if (currentlyInWishlist) {
      // Already in wishlist, no need to add again
      return;
    }
    
    // Optimistically add to wishlist
    setEntries((prev) => {
      // Double-check to avoid duplicates
      const existingIds = prev.map((entry) => {
        // Extract entry ID from entry.stay (which contains the actual service object)
        const entryId = (entry.stay as any)?._id || (entry.stay as any)?.id || entry.id;
        return String(entryId);
      });
      if (existingIds.includes(normalizedId)) {
        return prev; // Already in wishlist
      }
      // Add optimistically with correct structure (all entries use 'stay' property regardless of service type)
      const newEntry: any = { 
        id: normalizedId, 
        stay: { _id: normalizedId } as any,
        type: serviceType 
      };
      return [...prev, newEntry];
    });
    
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
        const errorData = await res.json();
        throw new Error(errorData?.message || "Failed to add to wishlist");
      }
      // Refresh to get the actual data from server
      await refresh();
    } catch (err: any) {
      // Rollback optimistic update on error
      setEntries((prev) => prev.filter((entry) => {
        // Extract entry ID from entry.stay (which contains the actual service object)
        const entryId = (entry.stay as any)?._id || (entry.stay as any)?.id || entry.id;
        return String(entryId) !== normalizedId;
      }));
      setError(err?.message || "Failed to add to wishlist");
    }
  }, [refresh, isInWishlist]);

  const removeFromWishlist = useCallback(async (serviceId: string, serviceType?: "stay" | "tour" | "adventure" | "vehicle-rental") => {
    setError(null);
    const normalizedId = String(serviceId);
    
    // Check if actually in wishlist before trying to remove
    if (!isInWishlist(normalizedId)) {
      // Not in wishlist, nothing to remove
      return;
    }
    
    // Store previous state for rollback
    let previousEntries: WishlistEntry<TStay>[] = [];
    setEntries((prev) => {
      previousEntries = [...prev];
      return prev.filter((entry) => {
        // Extract entry ID from entry.stay (which contains the actual service object)
        const entryId = (entry.stay as any)?._id || (entry.stay as any)?.id || entry.id;
        return String(entryId) !== normalizedId;
      });
    });
    
    try {
      const res = await fetch(`/api/wishlist/${serviceId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 401) {
        throw new Error("Please log in to manage favourites.");
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.message || "Failed to remove from wishlist");
      }
      // Refresh to get the actual data from server
      await refresh();
    } catch (err: any) {
      // Rollback optimistic update on error
      setEntries(previousEntries);
      setError(err?.message || "Failed to update wishlist");
    }
  }, [refresh, isInWishlist]);

  const toggleWishlist = useCallback(
    async (serviceId: string, nextState?: boolean, serviceType?: "stay" | "tour" | "adventure" | "vehicle-rental") => {
      const normalizedId = String(serviceId);
      // Use isInWishlist for more robust checking (includes fallback)
      const currentlyWishlisted = isInWishlist(normalizedId);
      const shouldAdd = nextState !== undefined ? nextState : !currentlyWishlisted;
      if (shouldAdd) {
        await addToWishlist(normalizedId, serviceType);
      } else {
        await removeFromWishlist(normalizedId, serviceType);
      }
    },
    [addToWishlist, removeFromWishlist, isInWishlist]
  );

  useEffect(() => {
    if (autoLoad) refresh();
  }, [autoLoad, refresh]);

  return {
    wishlistEntries: entries,
    wishlistIds,
    isInWishlist,
    wishlistLoaded: loadedOnce,
    loading,
    error,
    refresh,
    toggleWishlist,
  };
}
