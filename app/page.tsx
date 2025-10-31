import Image from "next/image";
import HeroSection from "./components/Pages/home/Hero";
import TourCategories from "./components/Pages/home/Categories";
import PopularTour from "./components/Pages/home/PropularTour";
import Opertunity from "./components/Pages/home/Oppertunity";
import Stats from "./components/Pages/home/Stats"
import OffersSection from "./components/Pages/home/OffersSection";
import TestimonialSection from "./components/Pages/home/Testimonial";
import RecentArticlesSection from "./components/Pages/home/RecentArticles";
import RecentGallerySection from "./components/Pages/home/RecentGallery";
import TravelHeroSection from "./components/Pages/home/TravelHero";
export default function Home() {
  return (
    <div className="w-full bg-white">
     <HeroSection/>
     <TourCategories/>
     <PopularTour/>
     <Opertunity/>
     <Stats/>
     <OffersSection/>
     <TestimonialSection/>
     <RecentArticlesSection/>
     <RecentGallerySection/>
     <TravelHeroSection/>
    </div>
  );
}
