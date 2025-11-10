"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";   
import {
  FaChartPie,
  FaUmbrellaBeach,
  FaPlaneDeparture,
  FaMoneyCheckAlt,
  FaUsers,
  FaFileAlt,
  FaComments,
  FaUserCircle
} from "react-icons/fa";
import { TbLogout } from "react-icons/tb";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const Sidebar: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const router = useRouter(); 

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // ✅ LOGOUT FUNCTION
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });

      // ✅ Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItem = (key: string, label: string, icon: any) => (
    <button
      onClick={() => toggleMenu(key)}
      className="flex w-full items-center justify-between p-2 rounded text-gray-700 hover:bg-gray-100 font-medium"
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

      <nav className="flex-1 space-y-2 text-sm mt-15">
        {/* Dashboard */}
        <button className="flex w-full items-center gap-3 p-2 rounded font-medium text-indigo-600 bg-indigo-50">
          <FaChartPie size={14}/> Dashboard
        </button>

        {/* Travel Partners */}
        <div>
          {menuItem("partners", "Travel Partners", <FaUmbrellaBeach size={14}/>)}
          {openMenu === "partners" && (
            <div className="ml-8 mt-2 text-sm space-y-1 text-gray-700">
              <div className="hover:text-indigo-600 cursor-pointer">All Partners</div>
              <div className="hover:text-indigo-600 cursor-pointer">Stays</div>
              <div className="hover:text-indigo-600 cursor-pointer">Tours</div>  
              <div className="hover:text-indigo-600 cursor-pointer">Adventures</div>
              <div className="hover:text-indigo-600 cursor-pointer">Vehicle Rental</div>
            </div>
          )}
        </div>

        {/* Bookings */}
        <div>
          {menuItem("bookings", "Manage Bookings", <FaPlaneDeparture size={14}/>)}
          {openMenu === "bookings" && (
            <div className="ml-8 mt-2 text-sm space-y-1 text-gray-700">
              <div className="hover:text-indigo-600 cursor-pointer">Stays</div>
              <div className="hover:text-indigo-600 cursor-pointer">Tours</div>
              <div className="hover:text-indigo-600 cursor-pointer">Adventures</div>
              <div className="hover:text-indigo-600 cursor-pointer">Vehicle Rental</div>
              <div className="hover:text-indigo-600 cursor-pointer">Cancellations</div>
            </div>
          )}
        </div>

        {/* Accounting */}
        <div>
          {menuItem("accounting", "Accounting", <FaMoneyCheckAlt size={14}/>)}
          {openMenu === "accounting" && (
            <div className="ml-8 mt-2 text-sm space-y-1 text-gray-700">
              <div className="hover:text-indigo-600 cursor-pointer">Transactions</div>
              <div className="hover:text-indigo-600 cursor-pointer">Invoices</div>
              <div className="hover:text-indigo-600 cursor-pointer">Refunds</div>
            </div>
          )}
        </div>

        {/* Customers */}
        <div>
          {menuItem("customers", "Customers", <FaUsers size={14}/>)}
          {openMenu === "customers" && (
            <div className="ml-8 mt-2 text-sm space-y-1 text-gray-700">
              <div className="hover:text-indigo-600 cursor-pointer">All Customers</div>
              <div className="hover:text-indigo-600 cursor-pointer">Reviews</div>
            </div>
          )}
        </div>

        {/* Reports */}
        <div>
          {menuItem("reports", "Reports", <FaFileAlt size={14}/>)}
          {openMenu === "reports" && (
            <div className="ml-8 mt-2 text-sm space-y-1 text-gray-700">
              <div className="hover:text-indigo-600 cursor-pointer">Sales</div>
              <div className="hover:text-indigo-600 cursor-pointer">Bookings</div>
              <div className="hover:text-indigo-600 cursor-pointer">Performance</div>
            </div>
          )}
        </div>

        {/* Chat */}
        <button className="flex w-full items-center gap-3 p-2 rounded text-gray-700 hover:bg-gray-100 font-medium">
          <FaComments size={14}/> Chat
        </button>
      </nav>

      {/* Bottom */}
      <div className="mt-auto space-y-2">
        <button className="flex items-center gap-3 w-full text-gray-700 hover:text-indigo-600 text-sm">
          <FaUserCircle size={14}/> Profile
        </button>

        {/* ✅ LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full text-gray-700 hover:text-red-600 text-sm"
        >
          <TbLogout size={14}/> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;