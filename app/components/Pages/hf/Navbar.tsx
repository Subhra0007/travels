"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaBars,
  FaTimes,
  FaBed,
  FaCompass,
  FaCarSide,
  FaDoorOpen,
  FaHome,
  FaCoffee,
  FaHotel,
  FaUsers,
  FaUser,
  FaRoute,
  FaHiking,
  FaMountain,
  FaShip,
  FaBicycle,
  FaArrowRight,
  FaChevronRight,
  FaBiking,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  /* ----------  Auth state ---------- */
  const [user, setUser] = useState<{
    fullName: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/profile", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.success) setUser(data.user);
        }
      } catch (_) {}
    };
    fetchMe();
  }, []);

  /* ----------  Avatar Component (same as ProfilePage) ---------- */
  const UserAvatar = ({ size = 40 }: { size?: number }) => {
    if (user?.avatar) {
      return (
        <Image
          src={user.avatar}
          alt={user.fullName}
          width={size}
          height={size}
          className="object-cover w-full h-full rounded-full"
        />
      );
    }

    const first = user?.fullName?.trim().charAt(0).toUpperCase() ?? "U";
    return (
      <div
        className="flex items-center justify-center text-white font-bold rounded-full"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.45,
          background: "linear-gradient(to bottom right, #a855f7, #ec4899)",
        }}
      >
        {first}
      </div>
    );
  };

  /* ----------  Main Services data (nested) ---------- */
  const mainServices = [
    {
      id: "stays",
      name: "Stays",
      subtext: "Cozy places to stay",
      href: "/services/stays",
      icon: <FaBed />,
      subServices: [
        { name: "Rooms", href: "/services/stays/rooms", icon: <FaDoorOpen /> },
        { name: "Homestays", href: "/services/stays/homestays", icon: <FaHome /> },
        { name: "BnBs", href: "/services/stays/bnbs", icon: <FaCoffee /> },
        { name: "Hotels", href: "/services/stays/hotels", icon: <FaHotel /> },
      ],
    },
    {
      id: "tours",
      name: "Tours",
      subtext: "Memorable journeys",
      href: "/services/tours",
      icon: <FaCompass />,
      subServices: [
        { name: "Group Tours", href: "/services/tours/group-tours", icon: <FaUsers /> },
        { name: "Personalized Tours", href: "/services/tours/personalized-tours", icon: <FaUser /> },
      ],
    },
    {
      id: "adventures",
      name: "Adventures",
      subtext: "Adrenaline rush",
      href: "/services/adventures",
      icon: <FaMountain />,
      subServices: [
        { name: "Trekking", href: "/services/adventures/trekking", icon: <FaRoute /> },
        { name: "Hiking", href: "/services/adventures/hiking", icon: <FaHiking /> },
        { name: "Mountain Ridge", href: "/services/adventures/mountain-ridge", icon: <FaMountain /> },
        { name: "Water Rafting", href: "/services/adventures/water-rafting", icon: <FaShip /> },
      ],
    },
    {
      id: "vehicle-rental",
      name: "Vehicle Rental",
      subtext: "Freedom to explore",
      href: "/services/vehicle-rental",
      icon: <FaCarSide />,
      subServices: [
        { name: "Cars", href: "/services/vehicle-rental/cars", icon: <FaCarSide /> },
        { name: "Bikes", href: "/services/vehicle-rental/bikes", icon: <FaBiking /> },
      ],
    },
  ];

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about-us" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(path + "/");
  };

  /* ----------  Hover handlers ---------- */
  const openDropdown = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsServicesOpen(true);
  };

  const closeDropdown = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsServicesOpen(false);
    }, 200);
  };

  /* ----------  Auto-select first category ---------- */
  useEffect(() => {
    if (isServicesOpen && !hoveredCategory) {
      setHoveredCategory("stays");
    } else if (!isServicesOpen) {
      setHoveredCategory(null);
    }
  }, [isServicesOpen, hoveredCategory]);

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
          {navItems.map((item) => {
            const isServices = item.label === "Services";

            return isServices ? (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdown}
              >
                <Link
                  href={item.href}
                  className="relative group flex flex-col items-center"
                >
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-base font-bold transition-all duration-300 ${
                        isActive(item.href)
                          ? "text-green-600"
                          : "text-gray-600 group-hover:text-green-600"
                      }`}
                    >
                      {item.label}
                    </span>
                    {isServicesOpen ? (
                      <FaChevronUp className="text-xs text-green-600" />
                    ) : (
                      <FaChevronDown className="text-xs text-gray-500 group-hover:text-green-600 transition-colors" />
                    )}
                  </div>

                  {/* Underline */}
                  {!isActive(item.href) && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-linear-to-r from-lime-600 via-green-500 to-lime-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full"></span>
                  )}
                  {isActive(item.href) && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-green-600 rounded-full"></span>
                  )}
                </Link>

                {/* GLASS MEGA DROPDOWN */}
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{
                    opacity: isServicesOpen ? 1 : 0,
                    y: isServicesOpen ? 0 : -10,
                    scale: isServicesOpen ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`absolute left-1/2 -translate-x-1/2 mt-4 w-2xl
                    backdrop-blur-3xl border-b border-white/20 rounded-2xl shadow-2xl border 
                    overflow-hidden ${isServicesOpen ? "pointer-events-auto" : "pointer-events-none"}`}
                  style={{ top: "100%" }}
                  onMouseEnter={openDropdown}
                  onMouseLeave={closeDropdown}
                >
                  <div className="p-8">
                    <div className="flex gap-12">
                      {/* Left: Categories */}
                      <div className="w-60 shrink-0 space-y-4 pr-6 border-r border-white/20">
                        {mainServices.map((service) => (
                          <div
                            key={service.id}
                            className={`
                              group flex items-center gap-4 p-5 rounded-xl cursor-pointer transition-all duration-300
                              ${
                                hoveredCategory === service.id
                                  ? "bg-white/70 shadow-lg border border-green-200/50 text-green-700"
                                  : "bg-white/50 hover:bg-white/70 border border-transparent hover:border-white/40 text-gray-700"
                              }
                            `}
                            onMouseEnter={() => setHoveredCategory(service.id)}
                            onClick={() => {
                              setIsServicesOpen(false);
                              router.push(service.href);
                            }}
                          >
                            <div className="shrink-0 w-11 h-11 rounded-lg bg-linear-to-br from-green-500 to-lime-500 flex items-center justify-center text-white shadow-md">
                              {service.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm leading-5">{service.name}</p>
                              <p className="text-xs text-gray-500 mt-1">{service.subtext}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Right: Sub-items */}
                      <div className="flex-1 pl-6 min-w-0">
                        {hoveredCategory ? (
                          (() => {
                            const category = mainServices.find((s) => s.id === hoveredCategory);
                            if (!category) return null;
                            return (
                              <div className="space-y-8">
                                <div className="flex items-center gap-6 p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm">
                                  <div className="shrink-0 w-20 h-20 rounded-xl bg-linear-to-br from-green-500 to-lime-500 flex items-center justify-center text-white text-3xl shadow-lg">
                                    {category.icon}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                                      {category.name}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-600">{category.subtext}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                  {category.subServices.map((sub) => (
                                    <Link
                                      key={sub.href}
                                      href={sub.href}
                                      onClick={() => setIsServicesOpen(false)}
                                      className="group flex flex-col items-center p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 hover:border-green-200/50 hover:bg-white/80 transition-all duration-300 shadow-sm hover:shadow-lg"
                                    >
                                      <div className="shrink-0 w-16 h-16 rounded-xl bg-linear-to-br from-green-500 to-lime-500 flex items-center justify-center text-white text-xl mb-6 shadow-lg">
                                        {sub.icon}
                                      </div>
                                      <p className="font-bold text-sm leading-5 text-gray-900 group-hover:text-green-600 text-center">
                                        {sub.name}
                                      </p>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 shadow-sm">
                            <div className="w-32 h-32 bg-linear-to-br from-green-400/30 to-lime-400/30 rounded-full flex items-center justify-center mb-8 shadow-lg">
                              <FaCompass className="w-20 h-20 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Explore Our Services</h3>
                            <p className="max-w-2xl mx-auto text-sm text-gray-600 leading-relaxed">
                              Hover over a category on the left to discover curated stays, tours, adventures, and vehicle rentals.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="relative group flex flex-col items-center"
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
            );
          })}
        </motion.div>

        {/* Desktop Auth Area - Avatar Clickable to Profile */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="hidden md:flex items-center space-x-3"
        >
          {!user ? (
            <>
              <Link href="/login">
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-base font-bold hover:bg-gray-50 transition shadow-md cursor-pointer">
                  Log In
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-4 py-2 bg-linear-to-r from-lime-400 to-green-400 text-white rounded-full text-base font-bold hover:from-lime-500 hover:to-green-500 transition shadow-md cursor-pointer">
                  Sign Up
                </button>
              </Link>
            </>
          ) : (
            <div className="relative group">
              {/* Clickable Avatar */}
              <button
                onClick={() => router.push("/profile")}
                className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden ring-2 ring-green-400 ring-offset-2 transition-all hover:ring-green-500 hover:scale-105 cursor-pointer"
              >
                <UserAvatar size={40} />
              </button>

              {/* Hover Tooltip */}
              <div className="absolute right-0 top-full mt-2 w-max opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                <div className="bg-white rounded-lg shadow-lg py-2 px-4 whitespace-nowrap flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Hi,</span>
                  <span className="text-sm font-semibold text-green-600 truncate max-w-[180px]">
                    {user.fullName}
                  </span>
                </div>
                <div className="absolute -top-1 right-3 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden flex`}
      >
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className="flex justify-end p-6">
            <button
              className="text-gray-700 p-2 bg-gray-100 rounded-full shadow"
              onClick={() => {
                setIsOpen(false);
                setMobileServicesOpen(false);
              }}
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Main Nav */}
          <div className="px-6 space-y-6">
            {navItems.map((item) => {
              if (item.label === "Services") {
                return (
                  <button
                    key={item.href}
                    onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                    className="flex items-center justify-between w-full text-lg font-semibold text-gray-800 hover:text-green-600"
                  >
                    <span>Services</span>
                    {mobileServicesOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-semibold text-gray-800 hover:text-green-600"
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* RIGHT-SIDE SCROLLABLE SERVICES PANEL */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: mobileServicesOpen ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-y-0 right-0 w-full bg-linear-to-b from-white to-green-50/30 shadow-xl overflow-hidden"
          >
            <div className="p-6">
              <button
                onClick={() => setMobileServicesOpen(false)}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700"
              >
                <FaChevronRight className="rotate-180" />
                Back to Menu
              </button>

              <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-8">
                {mainServices.map((service) => (
                  <div key={service.id} className="space-y-4">
                    {/* Category Header */}
                    <div className="flex items-center gap-4 p-4 bg-linear-to-r from-green-50 to-lime-50 rounded-xl shadow-sm">
                      <div className="w-12 h-12 bg-linear-to-br from-green-500 to-lime-500 rounded-xl flex items-center justify-center text-white shadow-md">
                        {service.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{service.name}</h4>
                        <p className="text-xs text-gray-600">{service.subtext}</p>
                      </div>
                    </div>

                    {/* Sub-items */}
                    <div className="space-y-2">
                      {service.subServices.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => {
                            setIsOpen(false);
                            setMobileServicesOpen(false);
                          }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100 hover:border-green-200 hover:bg-green-50/60 transition-all duration-200 shadow-sm"
                        >
                          <span className="text-green-500">{sub.icon}</span>
                          <span className="font-medium text-gray-700">{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Auth Buttons - Fixed Avatar Size */}
        <div className="absolute bottom-8 left-6 right-6 flex gap-3">
          {!user ? (
            <>
              <Link href="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                <button className="w-full py-3 bg-gray-100 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition shadow-sm cursor-pointer">
                  Log In
                </button>
              </Link>
              <Link href="/signup" className="flex-1" onClick={() => setIsOpen(false)}>
                <button className="w-full py-3 bg-linear-to-r from-lime-400 to-green-400 text-white rounded-full text-sm font-medium hover:from-lime-500 hover:to-green-500 transition shadow-md cursor-pointer">
                  Sign Up
                </button>
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/profile");
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-green-300 text-green-700 rounded-full text-sm font-medium hover:bg-green-50 transition shadow-sm"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                <UserAvatar size={36} />
              </div>
              <span className="truncate text-sm">{user.fullName.split(" ")[0]}</span>
            </button>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => {
            setIsOpen(false);
            setMobileServicesOpen(false);
          }}
        />
      )}
    </motion.nav>
  );
};

export default Navbar;