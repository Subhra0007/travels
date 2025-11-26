// app/hooks/useCart.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type CartItem = {
  _id: string;
  itemId: string;
  itemType: "Product" | "Stay" | "Tour" | "Adventure" | "VehicleRental";
  quantity: number;
  item: any;
};

type UseCartOptions = {
  autoLoad?: boolean;
};

export function useCart({ autoLoad = false }: UseCartOptions = {}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (res.status === 401) {
        setItems([]);
        setError("You need to log in to use cart.");
        return;
      }
      if (!res.ok) {
        throw new Error((await res.json())?.message || "Failed to load cart");
      }
      const data = await res.json();
      setItems(Array.isArray(data?.cart) ? data.cart : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load cart");
    } finally {
      setLoading(false);
      setLoadedOnce(true);
    }
  }, []);

  const addToCart = useCallback(
    async (
      itemId: string,
      itemType: "Product" | "Stay" | "Tour" | "Adventure" | "VehicleRental",
      quantity: number = 1
    ) => {
      setError(null);
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ itemId, itemType, quantity }),
        });
        if (res.status === 401) {
          throw new Error("Please log in to add to cart.");
        }
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.message || "Failed to add to cart");
        }
        await refresh();
      } catch (err: any) {
        setError(err?.message || "Failed to add to cart");
        throw err;
      }
    },
    [refresh]
  );

  const removeFromCart = useCallback(
    async (cartItemId: string) => {
      setError(null);
      try {
        const res = await fetch(`/api/cart/${cartItemId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.status === 401) {
          throw new Error("Please log in to manage cart.");
        }
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.message || "Failed to remove from cart");
        }
        await refresh();
      } catch (err: any) {
        setError(err?.message || "Failed to remove from cart");
        throw err;
      }
    },
    [refresh]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      setError(null);
      if (quantity < 1) {
        await removeFromCart(cartItemId);
        return;
      }
      try {
        const res = await fetch(`/api/cart/${cartItemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ quantity }),
        });
        if (res.status === 401) {
          throw new Error("Please log in to manage cart.");
        }
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.message || "Failed to update cart");
        }
        await refresh();
      } catch (err: any) {
        setError(err?.message || "Failed to update cart");
        throw err;
      }
    },
    [refresh, removeFromCart]
  );

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.item?.price || item.item?.basePrice || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  useEffect(() => {
    if (autoLoad) refresh();
  }, [autoLoad, refresh]);

  return {
    items,
    loading,
    error,
    cartLoaded: loadedOnce,
    refresh,
    addToCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
  };
}

