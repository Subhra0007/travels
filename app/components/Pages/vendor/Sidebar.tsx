"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [openProperties, setOpenProperties] = useState(false);
  const [allowedServices, setAllowedServices] = useState<string[]>([]);

  // Open Properties submenu when on any properties route
  useEffect(() => {
    if (pathname?.startsWith("/vendor/properties")) {
      setOpenProperties(true);
    }
  }, [pathname]);

  // Load vendor selected services from localStorage (kept updated by /vendor page)
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const rawServices: string[] = stored?.vendorServices || [];

      // normalize ids to match routes/keys
      const normalized = rawServices.map((s) => {
        if (s === "vehicle") return "vehicle-rental";
        return s;
      });

      setAllowedServices(normalized);
    } catch {
      setAllowedServices([]);
    }
  }, []);

  // ✅ Logout Method
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
      }
      window.location.href = "/login"; // ✅ redirect
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Full Properties list with ids to filter by vendor selection
  const propertiesSubmenu = [
    { id: "stays", name: "Stays", icon: <FaBed size={16} />, href: "/vendor/properties/stays" },
    { id: "tours", name: "Tours", icon: <FaCompass size={16} />, href: "/vendor/properties/tours" },
    { id: "adventures", name: "Adventures", icon: <FaMountain size={16} />, href: "/vendor/properties/adventures" },
    { id: "vehicle-rental", name: "Vehicle Rental", icon: <FaCar size={16} />, href: "/vendor/properties/vehicle-rental" },
  ];

  // Filter by allowed services; if none selected, show nothing under Properties
  const filteredProperties = propertiesSubmenu.filter((item) =>
    allowedServices.includes(item.id)
  );

  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/vendor" },

    {
      name: "Properties",
      icon: <Building2 size={18} />,
      submenu: filteredProperties,
    },

    { name: "Booking", icon: <CalendarCheck size={18} />, href: "/vendor/bookings" },

    { name: "Payment", icon: <CreditCard size={18} />, href: "/vendor/payments" },

    { name: "Profile", icon: <UserCog size={18} />, href: "/vendor/profile" },

    // ✅ Logout now uses an action, not a link
    { name: "Logout", icon: <LogOut size={18} />, action: "logout" },
  ];

  const isActiveHref = (href?: string) => {
    if (!href || !pathname) return false;
    if (href === "/vendor") return pathname === "/vendor";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const anyPropertiesActive = filteredProperties.some((sub) => isActiveHref(sub.href));

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col px-4 py-6">

      <nav className="space-y-3 mt-15">
        {menu
          // If no allowed services, omit Properties menu entirely
          .filter((item) => !item.submenu || item.submenu.length > 0)
          .map((item) => (
          <div key={item.name}>
            
            {/* ✅ SUBMENU */}
            {item.submenu ? (
              <>
                <button
                  onClick={() => setOpenProperties(!openProperties)}
                  className={`flex items-center justify-between w-full p-2 rounded-md transition ${
                    anyPropertiesActive
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-600"
                  }`}
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
                        className={`flex items-center gap-2 p-2 rounded-md transition ${
                          isActiveHref(sub.href)
                            ? "text-indigo-600 bg-indigo-50"
                            : "text-gray-700 hover:text-indigo-600"
                        }`}
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
                className="flex items-center gap-2 text-gray-700 hover:text-red-600 p-2 rounded-md transition w-full cursor-pointer"
              >
                {item.icon}
                <span>{item.name}</span>
              </button>

            ) : (
              
              /* ✅ NORMAL MENU ITEM */
              <Link
                href={item.href!}
                className={`flex items-center gap-2 p-2 rounded-md transition ${
                  isActiveHref(item.href)
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
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
