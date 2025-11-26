"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { FaCheck, FaPlus, FaShoppingBag } from "react-icons/fa";
import { useCart } from "../hooks/useCart";
import PageLoader from "../components/common/PageLoader";

type Address = {
  _id: string;
  name: string;
  phone: string;
  pincode: string;
  address: string;
  city: string;
  state: string;
  landmark?: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: cartItems, totalPrice: cartTotal } = useCart({ autoLoad: true });

  const itemId = searchParams.get("item");
  const itemType = searchParams.get("type") as "Product" | "Stay" | "Tour" | "Adventure" | "VehicleRental" | null;
  const quantity = parseInt(searchParams.get("quantity") || "1");
  const fromCart = searchParams.get("fromCart") === "true";

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    pincode: "",
    address: "",
    city: "",
    state: "",
    landmark: "",
  });

  useEffect(() => {
    loadData();
  }, [itemId, itemType, fromCart]);

  const loadData = async () => {
    try {
      // Load item
      if (fromCart && cartItems.length > 0) {
        // Use cart items
        const productItems = cartItems.filter((i) => i.itemType === "Product");
        if (productItems.length > 0) {
          setItem({ items: productItems, isCart: true });
        }
      } else if (itemId && itemType) {
        // Load single item
        let apiPath = "";
        if (itemType === "Product") {
          apiPath = `/api/products/${itemId}`;
        } else if (itemType === "Stay") {
          apiPath = `/api/stays/${itemId}`;
        } else if (itemType === "Tour") {
          apiPath = `/api/tours/${itemId}`;
        } else if (itemType === "Adventure") {
          apiPath = `/api/vendor/adventures/${itemId}`;
        } else if (itemType === "VehicleRental") {
          apiPath = `/api/vehicle-rentals/${itemId}`;
        }
        
        if (apiPath) {
          const res = await fetch(apiPath);
          if (res.ok) {
            const data = await res.json();
            const itemData = data.product || data.stay || data.tour || data.adventure || data.vehicleRental || data;
            setItem({ ...itemData, itemType, quantity, isCart: false });
          }
        }
      }

      // Load addresses
      const addrRes = await fetch("/api/addresses", { credentials: "include" });
      if (addrRes.ok) {
        const addrData = await addrRes.json();
        setAddresses(addrData.addresses || []);
        if (addrData.addresses && addrData.addresses.length > 0) {
          setSelectedAddress(addrData.addresses[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.pincode || !newAddress.address || !newAddress.city || !newAddress.state) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newAddress),
      });

      if (!res.ok) {
        throw new Error("Failed to add address");
      }

      const data = await res.json();
      setAddresses([...addresses, data.address]);
      setSelectedAddress(data.address);
      setShowNewAddress(false);
      setNewAddress({ name: "", phone: "", pincode: "", address: "", city: "", state: "", landmark: "" });
    } catch (err) {
      alert("Failed to add address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select or add an address");
      return;
    }

    setProcessing(true);
    try {
      let orderItems: any[] = [];

      if (item?.isCart) {
        // From cart - use all product items
        orderItems = item.items.map((cartItem: any) => ({
          itemId: cartItem.itemId,
          itemType: cartItem.itemType,
          quantity: cartItem.quantity,
        }));
      } else if (item) {
        // Single item
        orderItems = [{
          itemId: item._id || itemId,
          itemType: item.itemType || itemType,
          quantity: item.quantity || quantity,
        }];
      }

      if (orderItems.length === 0) {
        throw new Error("No items to order");
      }

      const totalAmount = item?.isCart
        ? cartTotal
        : (item?.price || item?.basePrice || 0) * (item?.quantity || quantity);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: orderItems,
          address: {
            name: selectedAddress.name,
            phone: selectedAddress.phone,
            pincode: selectedAddress.pincode,
            address: selectedAddress.address,
            city: selectedAddress.city,
            state: selectedAddress.state,
            landmark: selectedAddress.landmark,
          },
          deliveryCharge: 15,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.message || "Failed to place order");
      }

      router.push("/profile/orders");
    } catch (err: any) {
      alert(err.message || "Failed to place order");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">No items to checkout</p>
          <button
            onClick={() => router.push("/services/products")}
            className="rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const subtotal = item.isCart
    ? cartTotal
    : (item.price || item.basePrice || 0) * (item.quantity || quantity);
  const deliveryCharge = 15;
  const total = subtotal + deliveryCharge;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          {/* Item Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            {item.isCart ? (
              <div className="space-y-3">
                {item.items.map((cartItem: any) => {
                  const itemData = cartItem.item;
                  const price = itemData?.price || itemData?.basePrice || 0;
                  const image = itemData?.images?.[0] || itemData?.photos?.[0] || "/placeholder.jpg";
                  return (
                    <div key={cartItem._id} className="flex gap-4 pb-3 border-b">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image src={image} alt={itemData?.name || "Product"} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{itemData?.name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {cartItem.quantity}</p>
                        <p className="text-lg font-bold text-green-600">₹{(price * cartItem.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={item.images?.[0] || item.photos?.[0] || "/placeholder.jpg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity || quantity}</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{((item.price || item.basePrice || 0) * (item.quantity || quantity)).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Address Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Address</h2>

            {addresses.length > 0 && (
              <div className="space-y-3 mb-4">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => setSelectedAddress(addr)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedAddress?._id === addr._id
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{addr.name}</p>
                        <p className="text-sm text-gray-600">{addr.address}</p>
                        <p className="text-sm text-gray-600">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        {addr.landmark && <p className="text-sm text-gray-500">Landmark: {addr.landmark}</p>}
                        <p className="text-sm text-gray-600 mt-1">Phone: {addr.phone}</p>
                      </div>
                      {selectedAddress?._id === addr._id && (
                        <FaCheck className="text-green-600 text-xl" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!showNewAddress ? (
              <button
                onClick={() => setShowNewAddress(true)}
                className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-gray-700 hover:border-green-600 hover:text-green-600"
              >
                <FaPlus /> Add New Address
              </button>
            ) : (
              <div className="space-y-4 p-4 border-2 border-green-600 rounded-lg">
                <h3 className="font-semibold text-gray-900">New Address</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Name *"
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Phone *"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Pincode *"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="City *"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="State *"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Landmark (optional)"
                    value={newAddress.landmark}
                    onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-600 focus:outline-none"
                  />
                </div>
                <textarea
                  placeholder="Address *"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-600 focus:outline-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddAddress}
                    className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700"
                  >
                    Save Address
                  </button>
                  <button
                    onClick={() => {
                      setShowNewAddress(false);
                      setNewAddress({ name: "", phone: "", pincode: "", address: "", city: "", state: "", landmark: "" });
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Price Details</h2>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Platform Charge</span>
              <span>₹{deliveryCharge}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={processing || !selectedAddress}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaShoppingBag /> {processing ? "Placing Order..." : "Buy"}
          </button>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Payment: Cash on Delivery only
          </p>
        </div>
      </div>
    </div>
  );
}

