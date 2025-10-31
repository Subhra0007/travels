import React from "react";
import { FaChartPie, FaUsers, FaBox, FaCog, FaComments, FaFileAlt, FaUserCircle } from "react-icons/fa";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
      <h1 className="text-2xl font-bold text-indigo-600 mb-8">GRUBHUB</h1>
      <nav className="flex-1 space-y-2">
        <a href="#" className="flex items-center gap-3 p-2 rounded-lg bg-indigo-50 text-indigo-600 font-medium">
          <FaChartPie /> Dashboard
        </a>
        <a href="#" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
          <FaUsers /> Vendors
        </a>
        <a href="#" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
          <FaBox /> Products
        </a>
        <a href="#" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
          <FaFileAlt /> Reports
        </a>
        <a href="#" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
          <FaComments /> Chat
        </a>
      </nav>
      <div className="mt-auto">
        <a href="#" className="flex items-center gap-3 text-gray-600 hover:text-indigo-600">
          <FaUserCircle /> Profile
        </a>
        <a href="#" className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 mt-2">
          <FaCog /> Settings
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
