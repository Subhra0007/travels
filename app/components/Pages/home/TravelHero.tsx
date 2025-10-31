"use client";

import React from "react";
import Image from "next/image";

const TravelHeroSection: React.FC = () => {
  return (
    <section className="bg-sky-50 py-17 ">
      <div className="max-w-7xl mx-auto px-6 lg:px-2">
      <div className="relative bg-cyan-500 text-white rounded-3xl overflow-hidden p-10  flex flex-col md:flex-row justify-between items-center">
        
        {/* ───────── Left Text Content ───────── */}
        <div className="relative z-10 max-w-xl lg:text-left text-center">
          <h1 className="text-3xl md:text-5xl font-bold leading-snug mb-6">
            Start your Journey With <br className="hidden md:block" /> a Single Click
          </h1>

          <button className="bg-white text-cyan-600 font-semibold px-6 py-3 rounded-xl shadow hover:bg-cyan-50 transition">
            ✈️ Explore Now
          </button>
        </div>

        {/* ───────── Floating Circular Images for lg ───────── */}
        <div className="relative  w-[280px] h-[280px] md:w-[420px] md:h-[420px] lg:block hidden">
          {/* Image 1 (Main large circle) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image
              src="/journey/journey1.jpg"
              alt="Image 1"
              fill
              className="object-cover"
            />
          </div>

          {/* Image 2 (Top-left smaller circle) */}
          <div className="absolute top-20 left-15  w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image
              src="/journey/Journey2.webp"
              alt="Image 2"
              fill
              className="object-cover"
            />
          </div>

          {/* Image 3 (Bottom-left smaller circle) */}
          <div className="absolute bottom-10 left-20  w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image
              src="/journey/Journey3.jpg"
              alt="Image 3"
              fill
              className="object-cover"
            />
          </div>
        </div>

        
        {/* ───────── Floating Circular Images for sm, md ───────── */}
        <div className="relative  w-[280px] h-[280px] md:w-[420px] md:h-[420px] block lg:hidden left-6">
          {/* Image 1 (Main large circle) */}
          <div className="absolute right-13 top-1/2 -translate-y-1/2 w-40 h-40 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image
              src="/journey/journey1.jpg"
              alt="Image 1"
              fill
              className="object-cover"
            />
          </div>

          {/* Image 2 (Top-left smaller circle) */}
          <div className="absolute top-10 left-0  w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image
              src="/journey/Journey2.webp"
              alt="Image 2"
              fill
              className="object-cover"
            />
          </div>

          {/* Image 3 (Bottom-left smaller circle) */}
          <div className="absolute bottom-5 left-4  w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image
              src="/journey/Journey3.jpg"
              alt="Image 3"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Optional Decorative Airplane Path */}
        {/* <Image
          src="/hero/airplane-path.png"
          alt="Airplane Path"
          width={300}
          height={300}
          className="absolute opacity-60 top-10 left-1/3"
        /> */}
      </div>
      </div>
    </section>
  );
};

export default TravelHeroSection;
