"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import CourseCard from "../../app/components/CourseCard";
import { LoadingState, ErrorState } from "../components/ui/index";
import { supabase } from "../lib/supabase";

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryParam = searchParams.get("category");
  const searchQuery = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("category");

        if (error) throw error;

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(data.map((item) => item.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        let query = supabase.from("courses").select("*");

        // Apply category filter
        if (categoryParam) {
          query = query.eq("category", categoryParam);
        }

        // Apply search filter
        if (searchQuery) {
          query = query.ilike("title", `%${searchQuery}%`);
        }

        // Execute query
        const { data, error } = await query;

        if (error) throw error;

        setCourses(data || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [categoryParam, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();

    // Update URL with search parameter
    const params = new URLSearchParams(searchParams);
    if (searchInput) {
      params.set("search", searchInput);
    } else {
      params.delete("search");
    }

    router.push(`/courses?${params.toString()}`);
  };

  const handleCategoryClick = (category) => {
    const params = new URLSearchParams(searchParams);

    if (category === categoryParam) {
      // If clicking on already selected category, remove the filter
      params.delete("category");
    } else {
      params.set("category", category);
    }

    router.push(`/courses?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/courses");
    setSearchInput("");
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">All Courses</h1>

      {/* Search and filter section */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        {/* Filters sidebar */}
        <div className="w-full md:w-1/4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Search</h3>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="flex-grow"
                />
                <Button type="submit">Search</Button>
              </form>
            </div>

            <div>
              <h3 className="font-medium mb-2">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <Button
                      variant={categoryParam === category ? "default" : "ghost"}
                      className="w-full justify-start text-left"
                      onClick={() => handleCategoryClick(category)}
                    >
                      {category}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {(categoryParam || searchQuery) && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </Card>
        </div>

        {/* Courses grid */}
        <div className="w-full md:w-3/4">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No courses found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {courses.length} courses found
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
