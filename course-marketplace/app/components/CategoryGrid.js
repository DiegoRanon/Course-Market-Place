"use client";

import { Card, CardContent } from "../../components/ui/card";
import Link from "next/link";

const categories = [
  { name: "Web Development", icon: "💻", count: 42 },
  { name: "Data Science", icon: "📊", count: 38 },
  { name: "Business", icon: "💼", count: 56 },
  { name: "Design", icon: "🎨", count: 24 },
  { name: "Marketing", icon: "📱", count: 32 },
  { name: "Personal Development", icon: "🧠", count: 18 },
];

export default function CategoryGrid() {
  return (
    <div className="container mx-auto py-16">
      <h2 className="text-3xl font-bold text-center mb-12">
        Browse Categories
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {categories.map((category) => (
          <Link
            href={`/courses?category=${encodeURIComponent(category.name)}`}
            key={category.name}
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
    </div>
  );
}
