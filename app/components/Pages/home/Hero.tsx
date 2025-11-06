"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FaSearch, FaCalendarAlt, FaUsers, FaCar, FaPlus, FaMinus } from "react-icons/fa";
import { BsCompass } from "react-icons/bs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

type Tab = {
  label: string;
  icon?: React.ReactNode;
};

const tabs: Tab[] = [
  { label: "Stays", icon: <FaCalendarAlt className="text-sm" /> },
  { label: "Tours", icon: <FaSearch className="text-sm" /> },
  { label: "Adventures", icon: <FaUsers className="text-sm" /> },
  { label: "Vehicle Rental", icon: <FaCar className="text-sm" /> },
];

/* ---------- LOCATION AUTOCOMPLETE DATA (demo) ---------- */
const locations = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Goa",
  "Jaipur",
  "Pune",
  "Ahmedabad",
];

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState<string>("Stays");

  /* ---------- STAYS STATE ---------- */
  const [location, setLocation] = useState<string>("Delhi");
  const [checkIn, setCheckIn] = useState<Date | null>(new Date("2024-06-24"));
  const [checkOut, setCheckOut] = useState<Date | null>(new Date("2024-06-27"));
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [showLocationMenu, setShowLocationMenu] = useState(false);

  const totalGuests = adults + children;

  const renderTabContent = () => {
    switch (activeTab) {
      case "Stays":
        return (
          <StaysForm
            location={location}
            setLocation={setLocation}
            checkIn={checkIn}
            setCheckIn={setCheckIn}
            checkOut={checkOut}
            setCheckOut={setCheckOut}
            adults={adults}
            setAdults={setAdults}
            children={children}
            setChildren={setChildren}
            totalGuests={totalGuests}
            locations={locations}
            showLocationMenu={showLocationMenu}
            setShowLocationMenu={setShowLocationMenu}
          />
        );
      case "Tours":
        return <ToursForm />;
      case "Adventures":
        return <AdventuresForm />;
      case "Vehicle Rental":
        return <VehicleRentalForm />;
      default:
        return null;
    }
  };

  return (
    <div className="">
      <section className="relative w-full flex items-center justify-center overflow-hidden py-20">
        {/* Background Image */}
        <Image
          src="/hero/hero.jpg"
          alt="Hero Background"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Glass Frame */}
        <div className="relative z-10 w-[90%] h-[85vh] border-3 border-white rounded-[40px] shadow-[0_8px_32px_rgba(31,38,135,0.37)] flex flex-col justify-between p-6 md:p-10 max-w-7xl mx-auto">
          {/* Tagline */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 mt-6 mb-8">
            <div className="hidden md:flex items-center gap-3 text-white/80">
              <div className="p-3 border border-white/30 rounded-full">
                <BsCompass className="text-xl" />
              </div>
              <p className="max-w-sm text-sm leading-relaxed">
                Traveling abroad is an exhilarating adventure filled with new
                experiences, diverse cultures, and unforgettable memories.
              </p>
            </div>
          </div>

          {/* Card with Tabs */}
          <div className="relative rounded-[30px] overflow-hidden border border-white shadow-lg ">
            {/* Tabs */}
            <div className="flex items-center justify-center px-4 md:px-8 py-3 backdrop-blur-md border-b border-white/20 w-full">
              <div className="grid grid-cols-2 md:flex gap-2 md:gap-4 justify-center w-full">
                {tabs.map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(tab.label)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-full transition-all duration-300 ${
                      activeTab === tab.label
                        ? "bg-white text-black font-semibold"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Form */}
            <div className="bg-white rounded-b-[30px] p-5">{renderTabContent()}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* --------------------------------------------------------------
   STAYS – REAL INPUTS
-------------------------------------------------------------- */
type StaysFormProps = {
  location: string;
  setLocation: (v: string) => void;
  checkIn: Date | null;
  setCheckIn: (v: Date | null) => void;
  checkOut: Date | null;
  setCheckOut: (v: Date | null) => void;
  adults: number;
  setAdults: (v: number) => void;
  children: number;
  setChildren: (v: number) => void;
  totalGuests: number;
  locations: string[];
  showLocationMenu: boolean;
  setShowLocationMenu: (v: boolean) => void;
};

const StaysForm: React.FC<StaysFormProps> = ({
  location,
  setLocation,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  adults,
  setAdults,
  children,
  setChildren,
  totalGuests,
  locations,
  showLocationMenu,
  setShowLocationMenu,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {/* ---------- LOCATION ---------- */}
      <div className="relative">
        <p className="text-xs text-gray-500 uppercase mb-1">Location</p>
        <Menu as="div" className="relative">
          <Menu.Button
            onClick={() => setShowLocationMenu(!showLocationMenu)}
            className="w-full text-left text-xl font-bold text-gray-900 flex items-center justify-between"
          >
            {location}
            <ChevronDownIcon className="w-5 h-5 ml-2 text-gray-600" />
          </Menu.Button>

          {showLocationMenu && (
            <Menu.Items
              static
              className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
            >
              {locations.map((city) => (
                <Menu.Item key={city}>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        setLocation(city);
                        setShowLocationMenu(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        active ? "bg-gray-100" : ""
                      }`}
                    >
                      {city}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          )}
        </Menu>
      </div>

      {/* ---------- CHECK-IN ---------- */}
      <div>
        <p className="text-xs text-gray-500 uppercase mb-1">Check-in</p>
        <DatePicker
          selected={checkIn}
          onChange={(date) => setCheckIn(date)}
          dateFormat="dd MMM yy"
          className="w-full text-xl font-bold text-gray-900 border-b-2 border-transparent focus:border-lime-500 outline-none"
          placeholderText="Select date"
        />
      </div>

      {/* ---------- CHECK-OUT ---------- */}
      <div>
        <p className="text-xs text-gray-500 uppercase mb-1">Check-out</p>
        <DatePicker
          selected={checkOut}
          onChange={(date) => setCheckOut(date)}
          dateFormat="dd MMM yy"
          minDate={checkIn ?? undefined}
          className="w-full text-xl font-bold text-gray-900 border-b-2 border-transparent focus:border-lime-500 outline-none"
          placeholderText="Select date"
        />
      </div>

      {/* ---------- GUESTS ---------- */}
      <div>
        <p className="text-xs text-gray-500 uppercase mb-1">Guests</p>
        <Menu as="div" className="relative">
          <Menu.Button className="w-full text-left text-xl font-bold text-gray-900 flex items-center justify-between">
            {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
            <ChevronDownIcon className="w-5 h-5 ml-2 text-gray-600" />
          </Menu.Button>

          <Menu.Items
            static
            className="absolute z-20 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
          >
            {/* Adults */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Adults</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAdults(Math.max(1, adults - 1))}
                  className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  <FaMinus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center">{adults}</span>
                <button
                  onClick={() => setAdults(adults + 1)}
                  className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  <FaPlus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Children</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChildren(Math.max(0, children - 1))}
                  className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  <FaMinus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center">{children}</span>
                <button
                  onClick={() => setChildren(children + 1)}
                  className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  <FaPlus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </Menu.Items>
        </Menu>
      </div>

      {/* ---------- SEARCH BUTTON ---------- */}
      <div className="flex items-end">
        <button className="w-full bg-linear-to-r from-lime-600 via-green-500 to-lime-300 text-black font-semibold py-2 rounded-full hover:scale-105 transition">
          Search Stays
        </button>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
   DUMMY FORMS
-------------------------------------------------------------- */
const ToursForm = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <div>
      <p className="text-xs text-gray-500 uppercase">Destination</p>
      <h3 className="text-xl font-bold text-gray-900">Mumbai</h3>
    </div>
    <div>
      <p className="text-xs text-gray-500 uppercase">Travel Date</p>
      <h3 className="text-xl font-bold text-gray-900">01 Jul'24</h3>
    </div>
    <div>
      <p className="text-xs text-gray-500 uppercase">Duration</p>
      <h3 className="text-xl font-bold text-gray-900">3 Days</h3>
    </div>
    <div className="flex items-end">
      <button className="w-full bg-linear-to-r from-lime-600 via-green-500 to-lime-300 text-black font-semibold py-2 rounded-full">
        Find Tours
      </button>
    </div>
  </div>
);

const AdventuresForm = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <div>
      <p className="text-xs text-gray-500 uppercase">Activity</p>
      <h3 className="text-xl font-bold text-gray-900">Trekking</h3>
    </div>
    <div>
      <p className="text-xs text-gray-500 uppercase">Location</p>
      <h3 className="text-xl font-bold text-gray-900">Himalayas</h3>
    </div>
    <div>
      <p className="text-xs text-gray-500 uppercase">Group Size</p>
      <h3 className="text-xl font-bold text-gray-900">4-6</h3>
    </div>
    <div className="flex items-end">
      <button className="w-full bg-linear-to-r from-lime-600 via-green-500 to-lime-300 text-black font-semibold py-2 rounded-full">
        Book Adventure
      </button>
    </div>
  </div>
);

const VehicleRentalForm = () => (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
    <div>
      <p className="text-xs text-gray-500 uppercase">Pick-up</p>
      <h3 className="text-xl font-bold text-gray-900">Delhi Airport</h3>
    </div>
    <div>
      <p className="text-xs text-gray-500 uppercase">Drop-off</p>
      <h3 className="text-xl font-bold text-gray-900">Mumbai City</h3>
    </div>
    <div>
      <p className="text-xs text-gray-500 uppercase">Pick-up Date</p>
      <h3 className="text-xl font-bold text-gray-900">05 Jul'24</h3>
    </div>
    <div>
      <p className="text-xs text-gray-500 uppercase">Return Date</p>
      <h3 className="text-xl font-bold text-gray-900">10 Jul'24</h3>
    </div>
    <div className="flex items-end">
      <button className="w-full bg-linear-to-r from-lime-600 via-green-500 to-lime-300 text-black font-semibold py-2 rounded-full">
        Rent Vehicle
      </button>
    </div>
  </div>
);
