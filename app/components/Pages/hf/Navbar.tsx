"use client";

import React from "react";
import Link from "next/link";
import { FaLeaf } from "react-icons/fa";

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-2 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-1 shadow-md">
          <div className="bg-lime-200 rounded-full p-2">
            <FaLeaf className="text-lime-700 text-lg" />
          </div>
          <span className="font-semibold text-gray-800 text-sm">Abc</span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center bg-white rounded-full shadow-md px-4 py-2 space-x-6 border border-gray-200">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition font-medium"
          >
            Home
          </Link>
          <Link
            href="/admin"
            className="text-sm text-gray-600 hover:text-gray-900 transition font-medium"
          >
            About Us
          </Link>
          <Link
            href="/services"
            className="text-sm text-gray-600 hover:text-gray-900 transition font-medium"
          >
            Services
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-gray-600 hover:text-gray-900 transition font-medium"
          >
            Pricing
          </Link>
          <Link
            href="/contact"
            className="text-sm text-gray-600 hover:text-gray-900 transition font-medium"
          >
            Contact Us
          </Link>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-3">
          <Link href="/login">
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition shadow-md">
              Log In
            </button>
          </Link>
          <Link href="/signup">
            <button className="px-4 py-2 bg-linear-to-r from-lime-400 to-green-400 text-white rounded-full text-sm font-medium hover:from-lime-500 hover:to-green-500 transition shadow-md">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
