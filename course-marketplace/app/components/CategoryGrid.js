"use client";

import Link from "next/link";

export default function CategoryGrid({
  title = "Popular Categories",
  categories = [
    { name: "Programming", icon: "💻", color: "bg-blue-500", href: "#" },
    { name: "Design", icon: "🎨", color: "bg-purple-500", href: "#" },
    { name: "Business", icon: "📊", color: "bg-green-500", href: "#" },
    { name: "Marketing", icon: "📈", color: "bg-red-500", href: "#" },
  ],
  backgroundClass = "bg-gray-50 dark:bg-gray-900",
  gridCols = "grid-cols-2 md:grid-cols-4",
  onCategoryClick = null,
  showLinks = true,
}) {
  const handleClick = (category) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  return (
    <section className={`py-16 ${backgroundClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <div className={`grid ${gridCols} gap-6`}>
          {categories.map((category) => {
            const CategoryContent = (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div
                  className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl`}
                >
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {category.name}
                </h3>
              </div>
            );

            if (showLinks && category.href) {
              return (
                <Link key={category.name} href={category.href}>
                  {CategoryContent}
                </Link>
              );
            }

            return (
              <div key={category.name} onClick={() => handleClick(category)}>
                {CategoryContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
