import Link from "next/link";
import Hero from "./components/Hero";
import CategoryGrid from "./components/CategoryGrid";
import CourseGrid from "./components/CourseGrid";
import StatsGrid from "./components/StatsGrid";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <Hero />

      {/* Featured Categories */}
      <CategoryGrid />

      {/* Featured Courses */}
      <CourseGrid />

      {/* Stats Section */}
      <StatsGrid />

      {/* Footer */}
      <Footer />
    </div>
  );
}
