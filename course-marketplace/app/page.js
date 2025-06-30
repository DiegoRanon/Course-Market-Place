import Link from "next/link";
import Hero from "./components/Hero";
import CategoryGrid from "./components/CategoryGrid";
import CourseGrid from "./components/CourseGrid";
import StatsGrid from "./components/StatsGrid";
import Footer from "./components/Footer";
import { supabase } from "./lib/supabase";

async function getFeaturedCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Error fetching featured courses:", error);
    return [];
  }

  return data || [];
}

export default async function Home() {
  const featuredCourses = await getFeaturedCourses();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <Hero />

      {/* Featured Categories */}
      <CategoryGrid />

      {/* Featured Courses */}
      <CourseGrid courses={featuredCourses} title="Featured Courses" />

      {/* Stats Section */}
      <StatsGrid />

      {/* Footer */}
      <Footer />
    </div>
  );
}
