"use client"; 

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  message: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Mary Collins",
    role: "Traveler",
    image: "/Testimonial/user1.png",
    message:
      "I had an incredible experience! The guides were professional and friendly. Every day was well planned and filled with amazing memories.",
  },
  {
    id: 2,
    name: "Daniel Harper",
    role: "Explorer",
    image: "/Testimonial/user2.png",
    message:
      "Best travel company I’ve used! From start to finish, everything was smooth, safe, and exciting. I can’t wait for my next trip.",
  },
  {
    id: 3,
    name: "Sophia Green",
    role: "Adventure Lover",
    image: "/Testimonial/user3.png",
    message:
      "Fantastic journey! Loved every single place we visited. Highly recommend to anyone looking for stress-free and adventurous tours.",
  },
];

const TestimonialSection: React.FC = () => {
  return (
    <section className="bg-sky-50 relative overflow-hidden pt-15 lg:pt-0">
      <div className="max-w-7xl mx-auto px-6 lg:px-2">
      {/* Decorative Airplane Line */}
      <div className="absolute top-8 right-12">
        <Image
          src="/Testimonial/plane3.png"
          alt="plane"
          width={100}
          height={100}
          className="opacity-80"
        />
      </div>

      {/* Section Header */}
      <div className="text-center lg:mb-2 mb-12">
        <p className="text-cyan-500 font-semibold text-lg">Our Travelers</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          What they are talking about
        </h2>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
        {/* Left Traveler Image */}
        <div className="w-full md:w-[40%] flex justify-center">
          <div className="w-full rounded-2xl overflow-hidden shadow-lg h-[300px]">
            <Image
              src="/Testimonial/Travelars.jpg"
              alt="Traveler"
              width={500}
              height={500}
              className="object-cover h-[300px]"
            />
          </div>
        </div>

        {/* Right Slider Section */}
        <div className="w-full md:w-[60%] ">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1} // Default for smaller screens
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              bulletClass: "swiper-pagination-bullet !bg-cyan-500",
            }}
            breakpoints={{
              768: {
                slidesPerView: 1, // 1 card on small and medium screens
              },
              1024: {
                slidesPerView: 2, // 2 cards on larger screens
              },
            }}
            className="mySwiper"
          >
            {testimonials.map((item) => (
              <SwiperSlide key={item.id} className="py-10">
                <div className="relative bg-white border border-gray-200 shadow-md rounded-2xl p-8 w-90 h-[300px]">
                  {/* Profile */}
                  <div className="flex items-center gap-4 mb-5">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="rounded-full border-4 border-white shadow-md object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-cyan-600">{item.role}</p>
                    </div>
                  </div>

                  {/* Message */}
                  <p className="text-gray-700 text-base leading-relaxed italic">
                    “{item.message}”
                  </p>

                  {/* Star Rating */}
                  <div className="flex gap-1 mt-5 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
