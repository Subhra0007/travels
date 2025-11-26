"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaArrowRight } from "react-icons/fa";
import { useCart } from "../../hooks/useCart";
import PageLoader from "../../components/common/PageLoader";

export default function CartPage() {
  const router = useRouter();
  const { items, loading, refresh, removeFromCart, updateQuantity, totalPrice } = useCart({ autoLoad: true });
  const [processing, setProcessing] = useState<string | null>(null);

  const handleRemove = async (cartItemId: string) => {
    if (!confirm("Remove this item from cart?")) return;
    setProcessing(cartItemId);
    try {
      await removeFromCart(cartItemId);
    } catch (err) {
      alert("Failed to remove item");
    } finally {
      setProcessing(null);
    }
  };

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemove(cartItemId);
      return;
    }
    setProcessing(cartItemId);
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch (err) {
      alert("Failed to update quantity");
    } finally {
      setProcessing(null);
    }
  };

  const handleBuyNow = (item: any) => {
    router.push(`/checkout?item=${item.itemId}&type=${item.itemType}&quantity=${item.quantity}`);
  };

  const handleCheckout = () => {
    // Only allow checkout for products
    const productItems = items.filter((item) => item.itemType === "Product");
    if (productItems.length === 0) {
      alert("Only products can be checked out together. Services must be purchased individually.");
      return;
    }
    router.push("/checkout?fromCart=true");
  };

  if (loading) {
    return <PageLoader />;
  }

  const productItems = items.filter((item) => item.itemType === "Product");
  const serviceItems = items.filter((item) => item.itemType !== "Product");
  const deliveryCharge = 15;
  const grandTotal = totalPrice + (productItems.length > 0 ? deliveryCharge : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <span className="text-sm text-gray-600">{items.length} item{items.length !== 1 ? "s" : ""}</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaShoppingCart className="text-6xl text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add items to your cart to get started</p>
          <button
            onClick={() => router.push("/services/products")}
            className="rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            {productItems.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Products</h2>
                {productItems.map((item) => {
                  const price = item.item?.price || item.item?.basePrice || 0;
                  const image = item.item?.images?.[0] || item.item?.photos?.[0] || "/placeholder.jpg";
                  return (
                    <div
                      key={item._id}
                      className="bg-white rounded-lg shadow p-6 flex gap-4"
                    >
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image src={image} alt={item.item?.name || "Product"} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.item?.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.item?.category}</p>
                        <p className="text-lg font-bold text-green-600">₹{price.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={processing === item._id}
                            className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={processing === item._id}
                            className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBuyNow(item)}
                            className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
                          >
                            Buy Now
                          </button>
                          <button
                            onClick={() => handleRemove(item._id)}
                            disabled={processing === item._id}
                            className="px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-semibold hover:bg-red-200 disabled:opacity-50"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {serviceItems.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Services</h2>
                {serviceItems.map((item) => {
                  const price = item.item?.price || item.item?.basePrice || 0;
                  const image = item.item?.images?.[0] || "/placeholder.jpg";
                  return (
                    <div
                      key={item._id}
                      className="bg-white rounded-lg shadow p-6 flex gap-4"
                    >
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image src={image} alt={item.item?.name || "Service"} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.item?.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.itemType}</p>
                        <p className="text-lg font-bold text-green-600">₹{price.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">Quantity: 1 (fixed)</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => handleBuyNow(item)}
                          className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
                        >
                          Buy Now
                        </button>
                        <button
                          onClick={() => handleRemove(item._id)}
                          disabled={processing === item._id}
                          className="px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-semibold hover:bg-red-200 disabled:opacity-50"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {productItems.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Platform Charge</span>
                  <span>₹{deliveryCharge}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700"
              >
                Proceed to Checkout <FaArrowRight />
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Only products can be checked out together
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

