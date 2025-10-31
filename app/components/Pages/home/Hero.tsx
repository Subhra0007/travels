"use client";

import React from "react";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { BsCompass } from "react-icons/bs";

const flightTabs = [
  { label: "Regular", active: true },
  { label: "Student" },
  { label: "Senior Citizen" },
  { label: "Armed Forces" },
  { label: "Doctor And Nurses" },
];

export default function HeroSection() {
  return (
      <div className="">
    <section className="relative w-full flex items-center justify-center overflow-hidden py-20">
      {/* 🌄 Background Image */}
      <Image
        src="/hero/hero.jpg" 
        alt="Hero Background"
        fill
        priority
        className="object-cover object-center"
      />

      {/* 🔲 Glass Frame */}
      <div className="relative z-10 w-[90%]  h-[85vh] border-3 border-white rounded-[40px]   shadow-[0_8px_32px_rgba(31,38,135,0.37)] flex flex-col justify-between p-6 md:p-10 max-w-7xl mx-auto ">

        {/* 🔹 Header */}
        <div className="flex items-center justify-between text-white">
          <h1 className="text-xl md:text-2xl font-semibold">Travelz</h1>
          <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition">
            <FiMenu size={22} />
          </button>
        </div>

        {/* 🧭 Tagline Section */}
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

        {/* ✈️ Flight Card */}
        <div className="relative   rounded-[30px] overflow-hidden border border-white shadow-lg">
          {/* Tabs Section */}
          <div className="flex flex-wrap items-center justify-between px-4 md:px-8 py-3 backdrop-blur-md border-b border-white/20">
            <div className="flex flex-wrap gap-2 md:gap-4">
              {flightTabs.map((tab) => (
                <button
                  key={tab.label}
                  className={`px-4 py-1.5 text-sm rounded-full transition-all duration-300 ${
                    tab.active
                      ? "bg-white text-black font-semibold"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Button */}
            <button className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-black font-semibold px-6 py-2 rounded-full transition-all">
              <FaSearch className="text-sm" />
              Search
            </button>
          </div>

          {/* Flight Details Section */}
          <div className="bg-white rounded-b-[30px] grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-200 text-left">
            {/* From */}
            <div className="p-5">
              <p className="text-xs text-gray-500 uppercase">From</p>
              <h3 className="text-2xl font-bold text-gray-900">Delhi</h3>
              <p className="text-xs text-gray-500 mt-1">
                DEL, Delhi Airport India
              </p>
            </div>

            {/* To */}
            <div className="p-5">
              <p className="text-xs text-gray-500 uppercase">To</p>
              <h3 className="text-2xl font-bold text-gray-900">Mumbai</h3>
              <p className="text-xs text-gray-500 mt-1">
                BOM, Chhatrapati Shivaji International
              </p>
            </div>

            {/* Departure */}
            <div className="p-5">
              <p className="text-xs text-gray-500 uppercase">Departure</p>
              <h3 className="text-2xl font-bold text-gray-900">24 June'24</h3>
              <p className="text-xs text-gray-500 mt-1">Sunday</p>
            </div>

            {/* Return */}
            <div className="p-5">
              <p className="text-xs text-gray-500 uppercase">Return</p>
              <h3 className="text-lg font-semibold text-gray-400">
                Tap to add a return date
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                for bigger discounts
              </p>
            </div>

            {/* Travellers & Class */}
            <div className="p-5">
              <p className="text-xs text-gray-500 uppercase">
                Travellers & Class
              </p>
              <h3 className="text-2xl font-bold text-gray-900">2 Traveller</h3>
              <p className="text-xs text-gray-500 mt-1">Business Class</p>
            </div>
          </div>
        </div>

        {/* 🧾 Bottom Texts */}
        {/* <div className="flex justify-between text-xs text-white/80 mt-3 px-1">
          <span>One Way Flight Extra Savings</span>
          <span>Book International And Domestic Flights</span>
        </div> */}
      </div>
    </section>
    </div>
  );
}
