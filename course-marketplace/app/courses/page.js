"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import CourseCard from "../../app/components/CourseCard";
// Import UI components directly
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
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
        // Fetch categories directly from the categories table
        const { data, error } = await supabase
          .from("categories")
          .select("id, name");

        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.warn("No categories found in the database");
          setCategories([{ id: "general", name: "General" }]);
          return;
        }

        // Store the full category objects to have access to both id and name
        console.log("Fetched categories:", data);
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Provide fallback categories so the UI doesn't break
        setCategories([{ id: "general", name: "General" }]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Skip fetching if categories aren't loaded yet and we need to filter by category
    if (categoryParam && categories.length === 0) {
      return;
    }

    const fetchCourses = async () => {
      setLoading(true);
      try {
        // Join with categories to get category names
        let query = supabase.from("courses").select(`
            *,
            categories:category_id (
              name
            )
          `);

        // Apply category filter - use the category ID
        if (categoryParam) {
          try {
            console.log(`Filtering courses by category: ${categoryParam}`);

            // Find the category object that matches the selected category name
            const selectedCategory = categories.find(
              (cat) => cat.name === categoryParam
            );

            if (selectedCategory) {
              console.log(
                `Found category ID: ${selectedCategory.id} for ${categoryParam}`
              );
              // Filter courses by category_id
              query = query.eq("category_id", selectedCategory.id);
            } else {
              console.log(`No category found with name: ${categoryParam}`);
              // If we can't find the category, return empty results
              setCourses([]);
              setLoading(false);
              return; // Exit early
            }
          } catch (err) {
            console.error("Error in category filtering:", err);
            // Continue with the query without filtering
          }
        }

        // Apply search filter
        if (searchQuery) {
          query = query.ilike("title", `%${searchQuery}%`);
        }

        console.log("Executing courses query...");
        // Execute query
        const { data, error } = await query;

        if (error) {
          console.error("Supabase courses query error:", error);
          throw error;
        }

        console.log(`Fetched ${data?.length || 0} courses:`, data);

        // Process the data to flatten the category structure for easier use in components
        const processedData = (data || []).map((course) => {
          const categoryName =
            course.categories?.name || course.category_name || course.category;
          console.log(`Processing course ${course.id}: Category data:`, {
            categoryId: course.category_id,
            categoryObj: course.categories,
            finalCategoryName: categoryName,
          });

          return {
            ...course,
            category_name: categoryName,
          };
        });

        console.log("Processed courses data:", processedData);
        setCourses(processedData);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please try again later.");
        // Set empty courses array to prevent undefined errors
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [categoryParam, searchQuery, categories]);

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
                  <div key={category.id} className="flex items-center">
                    <Button
                      variant={
                        categoryParam === category.name ? "default" : "ghost"
                      }
                      className="w-full justify-start text-left"
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      {category.name}
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
