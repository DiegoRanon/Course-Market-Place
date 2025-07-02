"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import Link from "next/link";
import { getAllCategories } from "@/app/lib/api/courses";

// Fallback categories in case database fetch fails
const fallbackCategories = [
  { name: "Web Development", icon: "💻", count: 42 },
  { name: "Data Science", icon: "📊", count: 38 },
  { name: "Business", icon: "💼", count: 56 },
  { name: "Design", icon: "🎨", count: 24 },
  { name: "Marketing", icon: "📱", count: 32 },
  { name: "Personal Development", icon: "🧠", count: 18 },
];

export default function CategoryGrid() {
  const [categories, setCategories] = useState(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await getAllCategories();
        if (error) throw error;

        // If we have data from the database, use it
        if (data && data.length > 0) {
          // Map the database categories to include icon and count
          const mappedCategories = data.map((category) => {
            // Find a matching fallback category for the icon, or use a default
            const matchingFallback = fallbackCategories.find(
              (fb) => fb.name.toLowerCase() === category.name.toLowerCase()
            );

            return {
              id: category.id,
              name: category.name,
              icon: category.icon || matchingFallback?.icon || "📚",
              count: category.count || 0,
            };
          });

          setCategories(mappedCategories);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err.message);
        // Keep using fallback categories
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto py-16">
      <h2 className="text-3xl font-bold text-center mb-12">
        Browse Categories
      </h2>
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-pulse">Loading categories...</div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          Error loading categories. Using default categories.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              href={`/courses?category=${encodeURIComponent(category.name)}`}
              key={category.id || category.name}
            >
              <Card
                className="h-full hover:shadow-md transition-shadow cursor-pointer"
                data-testid="category-card"
              >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-medium mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count} courses
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
