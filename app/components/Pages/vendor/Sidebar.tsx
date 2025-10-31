"use client";
import { Home, Package, Truck, Settings } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  const menu = [
    { name: "Dashboard", icon: <Home size={18} />, href: "/admin/dashboard" },
    { name: "Orders", icon: <Package size={18} />, href: "/admin/orders" },
    { name: "Shipment", icon: <Truck size={18} />, href: "/admin/shipment" },
    { name: "Profile", icon: <Settings size={18} />, href: "/admin/profile" },
  ];

  return (
    <aside className="h-screen w-60 bg-white border-r shadow-sm fixed left-0 top-0 px-4 py-6">
      <h2 className="text-2xl font-bold text-blue-600 mb-10">Sky Line</h2>

      <nav className="space-y-4">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-2 text-gray-700 hover:bg-blue-100 p-2 rounded-md transition"
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
