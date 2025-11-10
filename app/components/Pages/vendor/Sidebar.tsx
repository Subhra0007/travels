"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  CreditCard,
  UserCog,
  LogOut,
  ChevronDown,
} from "lucide-react";
import {
  FaCar,
  FaCompass,
  FaMountain,
  FaBed
} from "react-icons/fa";
import Link from "next/link";

export default function Sidebar() {
  const [openProperties, setOpenProperties] = useState(false);

  // ✅ Logout Method
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/login"; // ✅ redirect
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/vendor" },

    {
      name: "Properties",
      icon: <Building2 size={18} />,
      submenu: [
        { name: "Stays", icon: <FaBed size={16} />, href: "/vendor/properties/stays" },
        { name: "Tours", icon: <FaCompass size={16} />, href: "/vendor/properties/tours" },
        { name: "Adventures", icon: <FaMountain size={16} />, href: "/vendor/properties/adventures" },
        { name: "Vehicle Rental", icon: <FaCar size={16} />, href: "/vendor/properties/vehicle-rental" },
      ],
    },

    { name: "Booking", icon: <CalendarCheck size={18} />, href: "/vendor/bookings" },

    { name: "Payment", icon: <CreditCard size={18} />, href: "/vendor/payments" },

    { name: "Profile", icon: <UserCog size={18} />, href: "/vendor/profile" },

    // ✅ Logout now uses an action, not a link
    { name: "Logout", icon: <LogOut size={18} />, action: "logout" },
  ];

  return (
    <aside className="max-h-full w-60 bg-white border-r shadow-sm left-0 top-0 px-4 py-6">

      <nav className="space-y-3 mt-10">
        {menu.map((item) => (
          <div key={item.name}>
            
            {/* ✅ SUBMENU */}
            {item.submenu ? (
              <>
                <button
                  onClick={() => setOpenProperties(!openProperties)}
                  className="flex items-center justify-between w-full text-gray-700 hover:bg-blue-100 p-2 rounded-md transition"
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>

                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      openProperties ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openProperties && (
                  <div className="ml-8 mt-2 space-y-2">
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-md transition"
                      >
                        {sub.icon}
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : item.action === "logout" ? (
              
              /* ✅ LOGOUT BUTTON */
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-700 hover:bg-red-100 p-2 rounded-md transition w-full"
              >
                {item.icon}
                <span>{item.name}</span>
              </button>

            ) : (
              
              /* ✅ NORMAL MENU ITEM */
              <Link
                href={item.href!}
                className="flex items-center gap-2 text-gray-700 hover:bg-blue-100 p-2 rounded-md transition"
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
