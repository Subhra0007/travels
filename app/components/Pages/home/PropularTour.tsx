"use client";

import Image from "next/image";
import { FaClock, FaMapMarkerAlt } from "react-icons/fa";

const tours = [
  {
    title: "Romantic Getaway to Paris",
    description: "Experience the timeless charm and elegance of the world's most romantic city.",
    image: "/popular/paris.jpg",
    duration: "5 Days / 4 Nights",
    price: "$1,200",
  },
  {
    title: "Sun-Kissed Santorini",
    description: "Explore beautiful beaches, stunning sunsets, and iconic white-washed houses.",
    image: "/popular/sunkissed.webp",
    duration: "6 Days / 5 Nights",
    price: "$1,350",
  },
  {
    title: "Tokyo Culture Immersion",
    description: "Experience modern innovation and Japan’s deep-rooted traditions in one amazing trip.",
    image: "/popular/Tokyo.jpg",
    duration: "7 Days / 6 Nights",
    price: "$1,600",
  },
];

const offsets = ["translate-y-0", "translate-y-8", "translate-y-0"];

export default function PopularTours() {
  return (
    <section className="bg-sky-50 pt-15">
      <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <p className="text-cyan-500 font-medium">World Awaits for You</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Most Popular Tour
        </h2>
      </div>

      {/* Zig-Zag Card Layout */}
      <div className="lg:block hidden">
      <div className="flex flex-wrap justify-center gap-6 ">
        {tours.map((tour, index) => (
          <div
            key={index}
            className={`bg-white w-[350px] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${offsets[index % offsets.length]}`}
          >
            {/* Image */}
            <div className="relative w-full h-52 ">
              <Image
                src={tour.image}
                alt={tour.title}
                fill
                className="object-cover transition-transform duration-500 hover:scale-110 p-2 rounded-2xl"
              />
            </div>

            {/* Content */}
            <div className="p-5 text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                {tour.title}
              </h3>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {tour.description}
              </p>

              <div className="flex items-center gap-2 text-gray-500 text-sm mt-3">
                <FaClock className="text-cyan-500" />
                <span>{tour.duration}</span>
              </div>

              <div className="flex items-center justify-between mt-5">
                <p className="text-lg font-semibold text-gray-800">{tour.price}</p>
                <button className="px-4 py-2 bg-cyan-500 text-white text-sm font-medium rounded-full hover:bg-cyan-600 transition">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div >
          {/* Card Layout in Mobile and Tabulate */}
          <div className="block lg:hidden">
      <div className="flex flex-wrap justify-center gap-6 ">
        {tours.map((tour, index) => (
          <div
            key={index}
            className={`bg-white w-[350px] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 `}
          >
            {/* Image */}
            <div className="relative w-full h-52 ">
              <Image
                src={tour.image}
                alt={tour.title}
                fill
                className="object-cover transition-transform duration-500 hover:scale-110 p-2 rounded-2xl"
              />
            </div>

            {/* Content */}
            <div className="p-5 text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                {tour.title}
              </h3>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {tour.description}
              </p>

              <div className="flex items-center gap-2 text-gray-500 text-sm mt-3">
                <FaClock className="text-cyan-500" />
                <span>{tour.duration}</span>
              </div>

              <div className="flex items-center justify-between mt-5">
                <p className="text-lg font-semibold text-gray-800">{tour.price}</p>
                <button className="px-4 py-2 bg-cyan-500 text-white text-sm font-medium rounded-full hover:bg-cyan-600 transition">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
      </div>
    </section>
  );
}
