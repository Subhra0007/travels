"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { FaBed, FaCompass, FaMountain, FaCar } from "react-icons/fa";
import { MdShoppingCart } from "react-icons/md";

// Image paths as constants to ensure consistency
const IMAGE_PATHS = {
  main: "/DSC_0164.JPG",
  topLeft: "/DSC_0283.JPG",
  bottomLeft: "/DSC_0353.JPG",
} as const;

// Shared spring configuration
const springTransition = {
  type: "spring" as const,
  stiffness: 120,
  damping: 14,
};

// Define variants
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
  const imageVariants = createImageVariants(0.2);
  const smallImageVariants = createImageVariants(0.4);
  const smallerImageVariants = createImageVariants(0.6);

  return (
    <section className="bg-sky-50 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-2">
        <div className="relative bg-green-600 text-white rounded-3xl overflow-hidden p-10 flex flex-col md:flex-row justify-between items-center">
          {/* Left Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 max-w-xl text-center lg:text-left"
          >
            <h1 className="text-3xl md:text-5xl font-bold leading-snug mb-6">
              Start your Journey With <br className="hidden md:block" /> a
              Single Click
            </h1>
            {/* Service Icons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6">

<Link
  href="/stays"
  className="w-28 h-28 md:w-32 md:h-32 flex flex-col items-center justify-center
  bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl 
  transition-all duration-300 hover:scale-105 group"
>
  <FaBed className="text-2xl md:text-3xl mb-2 group-hover:text-green-200 transition-colors" />
  <span className="text-sm md:text-base font-medium">Stays</span>
</Link>

<Link
  href="/tours"
  className="w-28 h-28 md:w-32 md:h-32 flex flex-col items-center justify-center
  bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl 
  transition-all duration-300 hover:scale-105 group"
>
  <FaCompass className="text-2xl md:text-3xl mb-2 group-hover:text-green-200 transition-colors" />
  <span className="text-sm md:text-base font-medium">Tours</span>
</Link>

<Link
  href="/adventures"
  className="w-28 h-28 md:w-32 md:h-32 flex flex-col items-center justify-center
  bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl 
  transition-all duration-300 hover:scale-105 group"
>
  <FaMountain className="text-2xl md:text-3xl mb-2 group-hover:text-green-200 transition-colors" />
  <span className="text-sm md:text-base font-medium">Adventures</span>
</Link>

<Link
  href="/vehicle-rental"
  className="w-28 h-28 md:w-32 md:h-32 flex flex-col items-center justify-center
  bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl 
  transition-all duration-300 hover:scale-105 group"
>
  <FaCar className="text-2xl md:text-3xl mb-2 group-hover:text-green-200 transition-colors" />
  <span className="text-sm md:text-base font-medium">Vehicle Rental</span>
</Link>

<Link
  href="/services/products"
  className="w-28 h-28 md:w-32 md:h-32 flex flex-col items-center justify-center
  bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl 
  transition-all duration-300 hover:scale-105 group"
>
  <MdShoppingCart className="text-2xl md:text-3xl mb-2 group-hover:text-green-200 transition-colors" />
  <span className="text-sm md:text-base font-medium">Shop</span>
</Link>

</div>

          </motion.div>

          {/* Floating Circular Images - Large Screens (lg+) */}
          <div className="relative w-[280px] h-[280px] md:w-[420px] md:h-[420px] hidden lg:block">
            {/* Main Large Circle */}
            <motion.div
              variants={imageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white shadow-lg"
              suppressHydrationWarning
            >
              <Image
                src={IMAGE_PATHS.main}
                alt="Travel destination 1"
                fill
                className="object-cover"
                priority
              />
            </motion.div>

            {/* Top-left Smaller Circle */}
            <motion.div
              variants={smallImageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="absolute top-20 left-16 w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-lg"
              suppressHydrationWarning
            >
              <Image
                src={IMAGE_PATHS.topLeft}
                alt="Travel destination 2"
                fill
                className="object-cover"
                priority
              />
            </motion.div>

            {/* Bottom-left Smaller Circle */}
            <motion.div
              variants={smallerImageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="absolute bottom-10 left-20 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg"
              suppressHydrationWarning
            >
              <Image
                src={IMAGE_PATHS.bottomLeft}
                alt="Travel destination 3"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </div>

          {/* Floating Circular Images - Small/Medium Screens */}
          <div className="relative w-[280px] h-[280px] md:w-[420px] md:h-[420px] block lg:hidden">
            {/* Main Large Circle */}
            <motion.div
              variants={imageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-40 h-40 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white shadow-lg"
              suppressHydrationWarning
            >
              <Image
                src={IMAGE_PATHS.main}
                alt="Travel destination 1"
                fill
                className="object-cover"
                priority
              />
            </motion.div>

            {/* Top-left Smaller Circle */}
            <motion.div
              variants={smallImageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="absolute top-10 left-3 w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-lg"
              suppressHydrationWarning
            >
              <Image
                src={IMAGE_PATHS.topLeft}
                alt="Travel destination 2"
                fill
                className="object-cover"
                priority
              />
            </motion.div>

            {/* Bottom-left Smaller Circle */}
            <motion.div
              variants={smallerImageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="absolute bottom-5 left-12 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg"
              suppressHydrationWarning
            >
              <Image
                src={IMAGE_PATHS.bottomLeft}
                alt="Travel destination 3"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelHeroSection;