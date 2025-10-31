"use client";

import React from "react";
import Image from "next/image";

const RecentGallerySection: React.FC = () => {
  return (
    <section className="bg-sky-50 pt-15 ">
      <div className="max-w-7xl mx-auto px-6 lg:px-2">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-cyan-500 font-semibold text-lg">It’s Your Travel Photo</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Recent Gallery</h2>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:h-[500px] h-[1000px]">
      
        {/* Image 1 */}
        <div className="grid gap-3">
          <div className="relative rounded-xl overflow-hidden group">
            <Image
              src="/gallery/image1.jpeg"
              alt="Gallery Image 1"
              fill
              className="object-cover group-hover:scale-110 transition duration-500"
            />
          </div>

          {/* Image 4 and Image 5 */}
          <div className="relative grid grid-cols-2 gap-5 rounded-xl overflow-hidden">
            <div className="relative group rounded-xl">
              <Image
                src="/gallery/image6.jpg"
                alt="Gallery Image 4"
                fill
                className="object-cover group-hover:scale-105 transition duration-500 rounded-xl"
              />
            </div>

            <div className="relative group rounded-xl">
              <Image
                src="/gallery/image2.jpeg"
                alt="Gallery Image 5"
                fill
                className="object-cover group-hover:scale-105 transition duration-500 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Image 2 */}
        <div className="relative col-span-1 rounded-xl overflow-hidden group">
          <Image
            src="/gallery/image3.jpeg"
            alt="Gallery Image 2"
            fill
            className="object-cover group-hover:scale-110 transition duration-500"
          />
        </div>

        <div className="grid gap-3">
          {/* Image 3 */}
          <div className="relative col-span-1 rounded-xl overflow-hidden group">
            <Image
              src="/gallery/image5.jpeg"
              alt="Gallery Image 3"
              fill
              className="object-cover group-hover:scale-110 transition duration-500"
            />
          </div>

          {/* Image 6 */}
          <div className="relative col-span-1 rounded-xl overflow-hidden group">
            <Image
              src="/gallery/image10.jpeg"
              alt="Gallery Image 6"
              fill
              className="object-cover group-hover:scale-110 transition duration-500"
            />
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};

export default RecentGallerySection;
