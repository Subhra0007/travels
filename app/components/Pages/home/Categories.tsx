"use client";

import React from "react";
import Image from "next/image";

const tours = [
  { title: "Adventure Trails", image: "/categories/adventure.webp" },
  { title: "Cultural Tours", image: "/categories/Cultural.jpg" },
  { title: "Beach Escapes", image: "/categories/beachescapes.jpg" },
  { title: "Luxury Voyages", image: "/categories/Luxuryvoyages.jpeg" },
  { title: "Wildlife Safaris", image: "/categories/Wildlife.jpg" },
  { title: "Mountain Hikes", image: "/categories/Montblanchike.jpeg" }, 
];

export default function TourCategories() {
  // create a wave pattern of vertical offsets
  const offsets = [
    "translate-y-0",
    "translate-y-8",
    "translate-y-16",
    "translate-y-16",
    "translate-y-8",
    "translate-y-0",
  ];

  return (
      <div className=" bg-sky-50">
    <section className="relative    flex flex-col items-center overflow-hidden  max-w-7xl mx-auto py-15 px-6 lg:px-0">
      {/* 🌎 Decorative small icons */}
      <Image
        src="/categories/plane.png"
        alt="plane icon"
        width={50}
        height={50}
        className="absolute top-10 lg:left-70 left-5 opacity-70 animate-float h-30 w-30 lg:block hidden"
      />
      <Image
        src="/categories/camera.png"
        alt="camera icon"
        width={45}
        height={45}
        className="absolute top-10 lg:right-80 right-10 opacity-70 animate-float-slow lg:block hidden"
      />

      {/* 🏷 Section Heading */}
      <div className="text-center mb-12">
        <p className="text-sky-500 text-sm font-medium tracking-wider">
          We Offer You The Best
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
          Tour Categories
        </h2>
      </div>

     {/* 🧳 Tour Cards - Zig-Zag Layout */}
     <div className="lg:block hidden">
<div className="flex flex-wrap justify-center gap-4 md:gap-8 ">
  {tours.map((tour, index) => (
    <div
      key={tour.title}
      className={`flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 ${offsets[index % offsets.length]}`}
    >
      {/* Reduced card size */}
      <div className="relative w-46 h-46 rounded-xl overflow-hidden shadow-md">
        <Image
          src={tour.image}
          alt={tour.title}
          fill
          className="object-cover hover:scale-110 transition-transform duration-500"
        />
      </div>
      <h3 className="text-sm sm:text-base font-semibold text-gray-800 mt-2">
        {tour.title}
      </h3>
    </div>
  ))}
</div>
</div>
<div className="block lg:hidden">
  <div className="flex flex-wrap justify-center gap-4 md:gap-8 ">
  {tours.map((tour, index) => (
    <div
      key={tour.title}
      className={`flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 `}
    >
      {/* Reduced card size */}
      <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-md">
        <Image
          src={tour.image}
          alt={tour.title}
          fill
          className="object-cover hover:scale-110 transition-transform duration-500"
        />
      </div>
      <h3 className="text-sm sm:text-base font-semibold text-gray-800 mt-2">
        {tour.title}
      </h3>
    </div>
  ))}
</div>
</div>
    </section>
    </div>
  );
}
