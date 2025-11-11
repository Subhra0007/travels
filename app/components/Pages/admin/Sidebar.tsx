"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  FaChartPie,
  FaUmbrellaBeach,
  FaPlaneDeparture,
  FaMoneyCheckAlt,
  FaUsers,
  FaFileAlt,
  FaComments,
  FaUserCircle,
} from "react-icons/fa";
import { RiCouponLine } from "react-icons/ri";

import { TbLogout } from "react-icons/tb";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const Sidebar: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Highlight current path
  const isActive = (path: string) => pathname === path;

  // ✅ Auto open dropdown based on current path
  useEffect(() => {
    if (pathname.startsWith("/admin/partners")) setOpenMenu("partners");
    else if (pathname.startsWith("/admin/bookings")) setOpenMenu("bookings");
    else if (pathname.startsWith("/admin/accounting")) setOpenMenu("accounting");
    else if (pathname.startsWith("/admin/customers")) setOpenMenu("customers");
    else if (pathname.startsWith("/admin/reports")) setOpenMenu("reports");
  }, [pathname]);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
      }
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
      }
      router.push("/");
    }
  };

  // ✅ Dropdown button (parent)
  const menuItem = (key: string, label: string, icon: any) => (
    <button
      onClick={() => toggleMenu(key)}
      className={`flex w-full items-center justify-between p-2 rounded font-medium transition-colors
        ${
          openMenu === key
            ? "text-indigo-600 bg-indigo-50"
            : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
        }`}
    >
      <span className="flex items-center gap-3">
        {icon} {label}
      </span>
      {openMenu === key ? (
        <IoIosArrowUp size={16} className="text-gray-500" />
      ) : (
        <IoIosArrowDown size={16} className="text-gray-500" />
      )}
    </button>
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
      <nav className="flex-1 space-y-2 text-sm mt-15 ">
        {/* Dashboard */}
        <button
          onClick={() => router.push("/admin")}
          className={`flex w-full items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer
            ${
              isActive("/admin")
                ? "text-indigo-600 bg-indigo-50"
                : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
            }`}
        >
          <FaChartPie size={14} /> Dashboard
        </button>

        {/* Products */}
        <button
          onClick={() => router.push("/admin/products")}
          className={`flex w-full items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer ${
            isActive("/admin/products")
              ? "text-indigo-600 bg-indigo-50"
              : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          }`}
        >
          <FaUsers size={14} /> Products
        </button>

        {/* Coupons */}
        <button
          onClick={() => router.push("/admin/coupons")}
          className={`flex w-full items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer ${
            isActive("/admin/coupons")
              ? "text-indigo-600 bg-indigo-50"
              : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          }`}
        >
          <RiCouponLine  size={14} /> Coupons
        </button>

        {/* Travel Partners */}
        <div>
          {menuItem("partners", "Travel Partners", <FaUmbrellaBeach size={14} />)}
          {openMenu === "partners" && (
            <div className="ml-8 mt-2 text-sm space-y-1 cursor-pointer">
              <div
                onClick={() => router.push("/admin/partners")}
                className={`cursor-pointer rounded px-2 py-1 transition-colors ${
                  isActive("/admin/partners")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                All Partners
              </div>
              <div
                onClick={() => router.push("/admin/partners/stays")}
                className={`cursor-pointer rounded px-2 py-1 transition-colors  ${
                  isActive("/admin/partners/stays")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                Stays
              </div>
              <div
                onClick={() => router.push("/admin/partners/tours")}
                className={`cursor-pointer rounded px-2 py-1 transition-colors ${
                  isActive("/admin/partners/tours")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                Tours
              </div>
              <div
                onClick={() => router.push("/admin/partners/adventures")}
                className={`cursor-pointer rounded px-2 py-1 transition-colors ${
                  isActive("/admin/partners/adventures")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                Adventures
              </div>
              <div
                onClick={() => router.push("/admin/partners/vehicle-rental")}
                className={`cursor-pointer rounded px-2 py-1 transition-colors ${
                  isActive("/admin/partners/vehicle-rental")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                Vehicle Rental
              </div>
            </div>
          )}
        </div>

        {/* Manage Bookings */}
        <div>
          {menuItem("bookings", "Manage Bookings", <FaPlaneDeparture size={14} />)}
          {openMenu === "bookings" && (
            <div className="ml-8 mt-2 text-sm space-y-1 cursor-pointer">
              {[
                { label: "Stays", path: "/admin/bookings/stays" },
                { label: "Tours", path: "/admin/bookings/tours" },
                { label: "Adventures", path: "/admin/bookings/adventures" },
                { label: "Vehicle Rental", path: "/admin/bookings/vehicle-rental" },
                { label: "Cancellations", path: "/admin/bookings/cancellations" },
              ].map((item) => (
                <div
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`cursor-pointer rounded px-2 py-1 transition-colors ${
                    isActive(item.path)
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-600"
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accounting */}
        <div>
          {menuItem("accounting", "Accounting", <FaMoneyCheckAlt size={14} />)}
          {openMenu === "accounting" && (
            <div className="ml-8 mt-2 text-sm space-y-1 cursor-pointer">
              {[
                { label: "Transactions", path: "/admin/accounting/transactions" },
                { label: "Invoices", path: "/admin/accounting/invoices" },
                { label: "Refunds", path: "/admin/accounting/refunds" },
              ].map((item) => (
                <div
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`cursor-pointer rounded px-2 py-1 transition-colors ${
                    isActive(item.path)
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-600"
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customers */}
        <div>
          {menuItem("customers", "Customers", <FaUsers size={14} />)}
          {openMenu === "customers" && (
            <div className="ml-8 mt-2 text-sm space-y-1">
              <div
                onClick={() => router.push("/admin/customers")}
                className={`cursor-pointer rounded px-2 py-1 transition-colors ${
                  isActive("/admin/customers")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                All Customers
              </div>
              <div
                onClick={() => router.push("/admin/customers/reviews")}
                className={`cursor-pointer rounded px-2 py-1 transition-colors ${
                  isActive("/admin/customers/reviews")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                Reviews
              </div>
            </div>
          )}
        </div>

        {/* Reports */}
        <div>
          {menuItem("reports", "Reports", <FaFileAlt size={14} />)}
          {openMenu === "reports" && (
            <div className="ml-8 mt-2 text-sm space-y-1 cursor-pointer">
              {[
                { label: "Sales", path: "/admin/reports/sales" },
                { label: "Bookings", path: "/admin/reports/bookings" },
                { label: "Performance", path: "/admin/reports/performance" },
              ].map((item) => (
                <div
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`cursor-pointer rounded px-2 py-1 transition-colors ${
                    isActive(item.path)
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-600"
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat */}
        <button
          onClick={() => router.push("/admin/chat")}
          className={`flex w-full items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer  ${
            isActive("/admin/chat")
              ? "text-indigo-600 bg-indigo-50"
              : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          }`}
        >
          <FaComments size={14} /> Chat
        </button>
      </nav>

      {/* Bottom Section */}
      <div className=" space-y-2 p-2 mt-25">
        <button
          onClick={() => router.push("/admin/profile")}
          className="flex items-center gap-3 w-full text-gray-700 hover:text-indigo-600 text-sm cursor-pointer"
        >
          <FaUserCircle size={14} /> Profile
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full text-gray-700 hover:text-red-600 text-sm cursor-pointer"
        >
          <TbLogout size={14} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
