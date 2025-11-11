"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";

const CurrentYear = () => {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);
  if (!year) return null;
  return <span>{year}</span>;
};

const Footer: React.FC = () => (
  <footer className="bg-[#061a23] text-gray-300 pt-12 pb-6 z-100">
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      {/* GRID TOP SECTION */}
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10 border-b border-gray-700 pb-10 sm:place-items-center md:place-items-center z-50">
        {/* Column 1 */}
        <div className="lg:text-left text-center">
          <h2 className="text-white text-xl font-semibold mb-4">About Us</h2>
          <p className="text-sm leading-relaxed mb-4">
            We bring innovative solutions that help businesses achieve their goals with 
            digital transformation and modern strategies.
          </p>
          <div className="flex space-x-4 text-xl justify-center lg:justify-start">
            <a href="#" className="hover:text-cyan-400"><FaFacebookF /></a>
            <a href="#" className="hover:text-cyan-400"><FaTwitter /></a>
            <a href="#" className="hover:text-cyan-400"><FaInstagram /></a>
            <a href="#" className="hover:text-cyan-400"><FaLinkedinIn /></a>
          </div>
        </div>

        {/* Column 2 */}
        <div className="lg:text-left text-center">
          <h2 className="text-white text-xl font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-cyan-400 transition">About Us</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition">Our Services</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition">Blog</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition">Contact</a></li>
          </ul>
        </div>

        {/* Column 3 */}
        <div className="lg:text-left text-center">
          <h2 className="text-white text-xl font-semibold mb-4">Contact Info</h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 justify-center lg:justify-start"><MdLocationOn className="text-cyan-400" /> Kolkata, India</li>
            <li className="flex items-center gap-2 justify-center lg:justify-start"><MdPhone className="text-cyan-400" /> +91 12345 98760</li>
            <li className="flex items-center gap-2 justify-center lg:justify-start"><MdEmail className="text-cyan-400" /> info@company.com</li>
          </ul>
        </div>

        {/* Column 4 */}
        <div className="lg:text-left text-center">
          <h2 className="text-white text-xl font-semibold mb-4">Newsletter</h2>
          <p className="text-sm mb-3">Subscribe to our latest updates and offers.</p>
          <form className="flex bg-white rounded-lg overflow-hidden w-full max-w-md mx-auto lg:mx-0">
            <input type="email" placeholder="Enter your email" className="w-2/3 py-2 px-3 text-gray-700 focus:outline-none" />
            <button type="submit" className="w-1/3 bg-cyan-500 py-2 text-white font-semibold hover:bg-cyan-600 transition">Subscribe</button>
          </form>
          <div className="mt-3">
            <label className="flex items-center text-xs text-gray-400 space-x-2 justify-center lg:justify-start">
              <input type="checkbox" className="accent-cyan-500" />
              <span>I agree to receive emails</span>
            </label>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center mt-6 text-sm text-gray-400 text-center md:text-left">
        <p>© <CurrentYear /> Safarhub. All Rights Reserved.</p>
        <div className="flex space-x-4 mt-3 md:mt-0">
          <img src="/footer/visa.png" alt="Visa" className="h-6" />
          <img src="/footer/mastercard.png" alt="Mastercard" className="h-6" />
          <img src="/footer/paypal.png" alt="Paypal" className="h-6" />
        </div>
      </div>
    </motion.div>
  </footer>
);

export default Footer;
