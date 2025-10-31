"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaLeaf, FaBars, FaTimes } from "react-icons/fa";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 lg:px-2 py-3 flex items-center justify-between">
        {/* ✅ LEFT: Logo */}
        <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-1 shadow-md">
          <div className="bg-lime-200 rounded-full p-2">
            <FaLeaf className="text-lime-700 text-lg" />
          </div>
          <span className="font-semibold text-gray-800 text-sm">Abc</span>
        </div>

        {/* ✅ RIGHT: Hamburger for mobile */}
        <button
          className="md:hidden text-gray-800 bg-white p-2 rounded-full shadow-md"
          onClick={() => setIsOpen(true)}
        >
          <FaBars size={18} />
        </button>

        {/* ✅ Desktop Navigation */}
        <div className="hidden md:flex items-center bg-white rounded-full shadow-md px-4 py-2 space-x-6 border border-gray-200">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition font-medium">
            Home
          </Link>
          <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900 transition font-medium">
            About Us
          </Link>
          <Link href="/services" className="text-sm text-gray-600 hover:text-gray-900 transition font-medium">
            Services
          </Link>
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition font-medium">
            Pricing
          </Link>
          <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition font-medium">
            Contact Us
          </Link>
        </div>

        {/* ✅ Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-3">
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

      {/* ✅ MOBILE RIGHT SLIDE DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 lg:hidden block ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          className="absolute top-6 right-6 text-gray-700 p-2 bg-gray-100 rounded-full shadow"
          onClick={() => setIsOpen(false)}
        >
          <FaTimes size={18} />
        </button>

        {/* Menu Items */}
        <div className="flex flex-col mt-24 items-start px-6 space-y-6">
          <Link href="/" onClick={() => setIsOpen(false)} className="text-lg text-gray-800 font-semibold hover:text-lime-600 transition">
            Home
          </Link>
          <Link href="/admin" onClick={() => setIsOpen(false)} className="text-lg text-gray-800 font-semibold hover:text-lime-600 transition">
            About Us
          </Link>
          <Link href="/services" onClick={() => setIsOpen(false)} className="text-lg text-gray-800 font-semibold hover:text-lime-600 transition">
            Services
          </Link>
          <Link href="/pricing" onClick={() => setIsOpen(false)} className="text-lg text-gray-800 font-semibold hover:text-lime-600 transition">
            Pricing
          </Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="text-lg text-gray-800 font-semibold hover:text-lime-600 transition">
            Contact Us
          </Link>

          {/* Buttons */}
          <div className="flex flex-row gap-4 space-y-3 mt-6 w-full">
            <Link href="/login">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-6 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition"
              >
                Log In
              </button>
            </Link>
            <Link href="/signup">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-6 py-2 bg-linear-to-r from-lime-400 to-green-400 text-white rounded-full text-sm font-medium hover:from-lime-500 hover:to-green-500 transition"
              >
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ✅ Optional Dim Background */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
