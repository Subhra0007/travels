import React from "react";
import { FaSearch } from "react-icons/fa";

const Topbar: React.FC = () => {
  return (
    <div className="flex justify-between items-center bg-white p-4 border-b border-gray-200">
      <div className="relative w-1/3">
        <FaSearch className="absolute top-3 left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search"
          className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-gray-700 font-medium">John Wick</span>
        <img
          src="https://i.pravatar.cc/40"
          alt="profile"
          className="w-10 h-10 rounded-full border"
        />
      </div>
    </div>
  );
};

export default Topbar;
