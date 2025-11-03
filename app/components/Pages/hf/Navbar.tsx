"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaBars, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about-us" },
    { label: "Services", href: "/services" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact Us", href: "/contact" },
  ];

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 bg-transparent"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-2 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center bg-white rounded-full px-4 lg:py-2 py-1 shadow-md"
        >
          <Image src="/logo.png" alt="Logo" width={26} height={26} className="rounded-full" />
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:hidden text-gray-800 bg-white p-2 rounded-full shadow-md"
          onClick={() => setIsOpen(true)}
        >
          <FaBars size={18} />
        </motion.button>

        {/* Desktop Menu */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="hidden md:flex items-center bg-white rounded-full shadow-md px-6 py-2 space-x-8 border border-gray-200"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative group flex flex-col items-center "
            >
              <span
                className={`text-base font-bold transition-all duration-300 ${
                  isActive(item.href)
                    ? "text-green-600"
                    : "text-gray-600 group-hover:text-green-600"
                }`}
              >
                {item.label}
              </span>

              {!isActive(item.href) && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-linear-to-r from-lime-600 via-green-500 to-lime-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full"></span>
              )}

              {isActive(item.href) && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-green-600 rounded-full"></span>
              )}
            </Link>
          ))}
        </motion.div>

        {/* Desktop Buttons */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="hidden md:flex items-center space-x-3"
        >
          <Link href="/login">
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-base font-bold hover:bg-gray-50 transition shadow-md">
              Log In
            </button>
          </Link>
          <Link href="/signup">
            <button className="px-4 py-2 bg-linear-to-r from-lime-400 to-green-400 text-white rounded-full text-base font-bold hover:from-lime-500 hover:to-green-500 transition shadow-md">
              Sign Up
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        <button
          className="absolute top-6 right-6 text-gray-700 p-2 bg-gray-100 rounded-full shadow"
          onClick={() => setIsOpen(false)}
        >
          <FaTimes size={18} />
        </button>

        <div className="flex flex-col mt-24 items-start px-6 space-y-6">

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="relative group text-lg font-semibold text-gray-800 hover:text-green-600 w-full"
            >
              {item.label}

              {!isActive(item.href) && (
                <span className="absolute -bottom-1 left-0 w-14 h-0.5 bg-linear-to-r from-lime-600 via-green-500 to-lime-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></span>
              )}

              {isActive(item.href) && (
                <span className="absolute -bottom-1 left-0 w-14 h-0.5 bg-green-600 rounded-full"></span>
              )}
            </Link>
          ))}

          <div className="flex flex-row gap-4 mt-6 w-full">
            <Link href="/login">
              <button className="w-full px-6 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-full text-sm font-medium">
                Log In
              </button>
            </Link>
            <Link href="/signup">
              <button className="w-full px-6 py-2 bg-linear-to-r from-lime-400 to-green-400 text-white rounded-full text-sm font-medium">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </motion.nav>
  );
};

export default Navbar;
