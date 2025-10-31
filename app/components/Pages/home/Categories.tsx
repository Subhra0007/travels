"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const tours = [
  { title: "Adventure Trails", image: "/categories/adventure.webp" },
  { title: "Cultural Tours", image: "/categories/Cultural.jpg" },
  { title: "Beach Escapes", image: "/categories/beachescapes.jpg" },
  { title: "Luxury Voyages", image: "/categories/Luxuryvoyages.jpeg" },
  { title: "Wildlife Safaris", image: "/categories/Wildlife.jpg" },
  { title: "Mountain Hikes", image: "/categories/Montblanchike.jpeg" },
];

// ✅ Animation direction for each card (desktop only)
const desktopAnim = [
  { x: -80, opacity: 0 }, // card 1 → left
  { x: -80, opacity: 0 }, // card 2 → left
  { y: -80, opacity: 0 }, // card 3 → top
  { y: -80, opacity: 0 }, // card 4 → top
  { x: 80, opacity: 0 },  // card 5 → right
  { x: 80, opacity: 0 },  // card 6 → right
];

export default function TourCategories() {
  const offsets = [
    "translate-y-0",
    "translate-y-8",
    "translate-y-16",
    "translate-y-16",
    "translate-y-8",
    "translate-y-0",
  ];

  return (
    <div className="bg-sky-50">
      
      <section className="relative flex flex-col items-center overflow-hidden max-w-7xl mx-auto py-15 px-6 lg:px-1">

        {/* ✅ Plane icon with animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute top-10 lg:left-70 left-5 opacity-70 lg:block hidden"
        >
          <Image
            src="/categories/plane.png"
            alt="plane icon"
            width={50}
            height={50}
            className="animate-float h-30 w-30"
          />
        </motion.div>

        {/* ✅ Camera icon with animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="absolute top-10 lg:right-80 right-10 opacity-70 lg:block hidden"
        >
          <Image
            src="/categories/camera.png"
            alt="camera icon"
            width={45}
            height={45}
            className="animate-float-slow"
          />
        </motion.div>

        {/* ✅ Heading animation (come from left) */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="text-sky-500 text-sm font-medium tracking-wider">
            We Offer You The Best
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Tour Categories
          </h2>
        </motion.div>

        {/* ✅ DESKTOP CARDS (Animation added — design preserved) */}
        <div className="lg:block hidden">
          <div className="flex flex-wrap justify-center gap-4 ">
            {tours.map((tour, index) => (
              <motion.div
                key={tour.title}
                initial={desktopAnim[index]}
                whileInView={{ x: 0, y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                className={`flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 ${offsets[index]}`}
              >
                <div className="relative w-49 h-49 rounded-xl overflow-hidden shadow-md">
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
              </motion.div>
            ))}
          </div>
        </div>

        {/* ✅ MOBILE CARDS (simple fade up – layout unchanged) */}
        <div className="block lg:hidden">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {tours.map((tour, index) => (
              <motion.div
                key={tour.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col items-center text-center transition-transform duration-300 hover:scale-105"
              >
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
