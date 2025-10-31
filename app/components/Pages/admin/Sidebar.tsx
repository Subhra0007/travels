"use client";
import React, { useState } from "react";
import {
  FaChartPie,
  FaUmbrellaBeach,
  FaPlaneDeparture,
  FaMoneyCheckAlt,
  FaUsers,
  FaFileAlt,
  FaComments,
  FaUserCircle,
  FaCog
} from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const Sidebar: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
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
      <h1 className="text-xl font-bold text-indigo-600 mb-8">TRAVEL ADMIN</h1>

      <nav className="flex-1 space-y-2 text-sm">

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
              <div className="hover:text-indigo-600 cursor-pointer">Tours & Packages</div>
              <div className="hover:text-indigo-600 cursor-pointer">Hotels & Stays</div>
              <div className="hover:text-indigo-600 cursor-pointer">Transport Services</div>
              <div className="hover:text-indigo-600 cursor-pointer">Payout</div>
            </div>
          )}
        </div>

        {/* Bookings */}
        <div>
          {menuItem("bookings", "Manage Bookings", <FaPlaneDeparture size={14}/>)}
          {openMenu === "bookings" && (
            <div className="ml-8 mt-2 text-sm space-y-1 text-gray-700">
              <div className="hover:text-indigo-600 cursor-pointer">Trips</div>
              <div className="hover:text-indigo-600 cursor-pointer">Flights</div>
              <div className="hover:text-indigo-600 cursor-pointer">Hotels</div>
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
        <button className="flex items-center gap-3 w-full text-gray-700 hover:text-indigo-600 text-sm">
          <FaCog size={14}/> Settings
        </button>
      </div>
    </aside>
  );
};


export default Sidebar;
