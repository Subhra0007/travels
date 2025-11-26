"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaShoppingBag, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import PageLoader from "../../components/common/PageLoader";

type OrderItem = {
  itemId: string;
  itemType: string;
  quantity: number;
  itemData?: any;
  variantId?: string | null;
  variant?: {
    color?: string;
    size?: string;
    price?: number;
    photos?: string[];
  } | null;
};

type Order = {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryCharge: number;
  address: {
    name: string;
    phone: string;
    pincode: string;
    address: string;
    city: string;
    state: string;
    landmark?: string;
  };
  status: string;
  createdAt: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/orders", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Placed":
        return "bg-blue-100 text-blue-700";
      case "Processing":
        return "bg-yellow-100 text-yellow-700";
      case "Shipped":
        return "bg-purple-100 text-purple-700";
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <span className="text-sm text-gray-600">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaShoppingBag className="text-6xl text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Your order history will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaShoppingBag className="text-green-600" />
                    <span className="font-semibold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-4">
                {order.items.map((item, idx) => {
                  const itemData = item.itemData;
                  const price = item.variant?.price ?? itemData?.price ?? itemData?.basePrice ?? 0;
                  const image =
                    item.variant?.photos?.[0] ||
                    itemData?.images?.[0] ||
                    itemData?.photos?.[0] ||
                    "/placeholder.jpg";
                  return (
                    <div key={idx} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image src={image} alt={itemData?.name || "Item"} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{itemData?.name || "Item"}</h3>
                        {item.variant && (
                          <p className="text-sm text-gray-600">
                            Variant:{" "}
                            <span className="font-medium text-gray-900">
                              {item.variant.color} • {item.variant.size}
                            </span>
                          </p>
                        )}
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-lg font-bold text-green-600">₹{(price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-green-600" />
                    Delivery Address
                  </h4>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">{order.address.name}</p>
                    <p>{order.address.address}</p>
                    <p>
                      {order.address.city}, {order.address.state} - {order.address.pincode}
                    </p>
                    {order.address.landmark && <p className="text-gray-500">Landmark: {order.address.landmark}</p>}
                    <p className="mt-1">Phone: {order.address.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Charge:</span>
                      <span className="font-medium">₹{order.deliveryCharge}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                      <span>Total:</span>
                      <span>₹{(order.totalAmount + order.deliveryCharge).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

