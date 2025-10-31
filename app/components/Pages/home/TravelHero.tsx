"use client";

import React from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

// Shared spring configuration
const springTransition = {
  type: "spring" as const,
  stiffness: 120,
  damping: 14,
};

// Define variants with proper typing
const createImageVariants = (delay: number): Variants => ({
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      ...springTransition,
      delay,
    },
  },
});

const TravelHeroSection: React.FC = () => {
  // Create variants with different delays
  const imageVariants = createImageVariants(0.2);
  const smallImageVariants = createImageVariants(0.4);
  const smallerImageVariants = createImageVariants(0.6);

  return (
    <section className="bg-sky-50 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-2">
        <div className="relative bg-cyan-500 text-white rounded-3xl overflow-hidden p-10 flex flex-col md:flex-row justify-between items-center">
          {/* Left Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 max-w-xl text-center lg:text-left"
          >
            <h1 className="text-3xl md:text-5xl font-bold leading-snug mb-6">
              Start your Journey With <br className="hidden md:block" /> a
              Single Click
            </h1>
            <button className="bg-white text-cyan-600 font-semibold px-6 py-3 rounded-xl shadow hover:bg-cyan-50 transition">
              Explore Now
            </button>
          </motion.div>

          {/* Floating Circular Images - Large Screens (lg+) */}
          <div className="relative w-[280px] h-[280px] md:w-[420px] md:h-[420px] hidden lg:block">
            {/* Main Large Circle */}
            <motion.div
              variants={imageVariants}
              initial="hidden"
              animate="visible"
              className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white shadow-lg"
            >
              <Image
                src="/journey/journey1.jpg"
                alt="Travel destination 1"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Top-left Smaller Circle */}
            <motion.div
              variants={smallImageVariants}
              initial="hidden"
              animate="visible"
              className="absolute top-20 left-16 w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-lg"
            >
              <Image
                src="/journey/Journey2.webp"
                alt="Travel destination 2"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Bottom-left Smaller Circle */}
            <motion.div
              variants={smallerImageVariants}
              initial="hidden"
              animate="visible"
              className="absolute bottom-10 left-20 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg"
            >
              <Image
                src="/journey/Journey3.jpg"
                alt="Travel destination 3"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>

          {/* Floating Circular Images - Small/Medium Screens */}
          <div className="relative w-[280px] h-[280px] md:w-[420px] md:h-[420px] block lg:hidden">
            {/* Main Large Circle */}
            <motion.div
              variants={imageVariants}
              initial="hidden"
              animate="visible"
              className="absolute right-12 top-1/2 -translate-y-1/2 w-40 h-40 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white shadow-lg"
            >
              <Image
                src="/journey/journey1.jpg"
                alt="Travel destination 1"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Top-left Smaller Circle */}
            <motion.div
              variants={smallImageVariants}
              initial="hidden"
              animate="visible"
              className="absolute top-10 left-0 w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-lg"
            >
              <Image
                src="/journey/Journey2.webp"
                alt="Travel destination 2"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Bottom-left Smaller Circle */}
            <motion.div
              variants={smallerImageVariants}
              initial="hidden"
              animate="visible"
              className="absolute bottom-5 left-4 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg"
            >
              <Image
                src="/journey/Journey3.jpg"
                alt="Travel destination 3"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelHeroSection;