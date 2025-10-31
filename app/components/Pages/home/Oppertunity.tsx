"use client";

import Image from "next/image";
import { FaUserFriends, FaUmbrellaBeach } from "react-icons/fa";
import { motion } from "framer-motion";

export default function AdventureSection() {
  return (
    <section className="bg-sky-50 pt-24  flex flex-col md:flex-row items-center justify-center gap-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-2">
      <div className=" grid lg:grid-cols-2 gap-10 grid-cols-1 w-full">

        {/* ✅ LEFT IMAGE COLUMN */}
        <div className="flex gap-4 lg:flex-row flex-col items-center">

          <div className="grid gap-4">

            {/* ✅ Image comes from LEFT */}
            <motion.div
              initial={{ x: -120, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative w-60 h-72 rounded-xl overflow-hidden shadow-lg"
            >
              <Image
                src="/oppertunity/Adventuredestination.jpg"
                alt="Adventure Destination"
                fill
                className="object-cover hover:scale-110 transition-transform duration-500"
              />
            </motion.div>

            {/* ✅ Box comes from BOTTOM */}
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="bg-cyan-500 text-white rounded-xl flex items-center justify-center w-60 h-24 text-lg font-semibold shadow-md"
            >
              Stories of Adventures
            </motion.div>
          </div>

          {/* ✅ Big image comes from TOP */}
          <motion.div
            initial={{ y: -120, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative w-80 h-100 rounded-xl overflow-hidden shadow-lg"
          >
            <Image
              src="/oppertunity/Travelerexploring.jpg"
              alt="Traveler exploring"
              fill
              className="object-cover hover:scale-110 transition-transform duration-500"
            />
          </motion.div>
        </div>

        {/* ✅ RIGHT CONTENT */}
        <div className="text-left relative">

          {/* ✅ Plane animation — float + fade */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="absolute -top-12 -right-12 hidden md:block"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Image
                src="/oppertunity/airplane.png"
                alt="Plane Illustration"
                width={100}
                height={100}
              />
            </motion.div>
          </motion.div>

          {/* ✅ Middle content (subheading + heading + text) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <p className="text-cyan-500 font-medium mb-2 lg:text-left text-center">
              Start Exploring
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Great Opportunity for <br /> Adventure & Travels
            </h2>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Explore new destinations, cultures, and breathtaking landscapes.
              Whether you’re seeking relaxation or adrenaline, there’s always
              something for every traveler to enjoy and cherish forever.
            </p>
          </motion.div>

          {/* ✅ Features come from RIGHT */}
          <motion.div
            initial={{ x: 120, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8"
          >
            <div className="flex items-start gap-3">
              <FaUserFriends className="text-cyan-500 text-2xl mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-gray-800">
                  Trusted Travel Guide
                </h4>
                <p className="text-gray-500 text-sm">
                  Includes the best hotels with private group packages.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaUmbrellaBeach className="text-cyan-500 text-2xl mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-gray-800">
                  Memorable Holidays
                </h4>
                <p className="text-gray-500 text-sm">
                  Explore top-rated destinations with luxury amenities.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ✅ Button + Author comes from BOTTOM */}
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="flex items-center gap-6"
          >
            <button className="bg-cyan-500 text-white px-6 py-3 rounded-full font-medium shadow-md hover:bg-cyan-600 transition">
              Book Now
            </button>

            <div className="flex items-center gap-3">
              <Image
                src="/oppertunity/Male.png"
                alt="Travel Guide"
                width={50}
                height={50}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold text-gray-800">Arjun Sharma</p>
                <p className="text-gray-500 text-sm">Tour Guide</p>
              </div>
            </div>
          </motion.div>

        </div>
        </div>
      </div>
    </section>
  );
}
