import Link from "next/link";

export default function Hero({
  title = "Learn from the best instructors",
  subtitle = "Master new skills with our comprehensive online courses",
  primaryButton = { text: "Explore Courses", href: "/courses" },
  secondaryButton = { text: "Start Learning", href: "/signup" },
  backgroundClass = "bg-gradient-to-r from-purple-600 to-blue-600",
  textColor = "text-white",
  subtitleColor = "text-purple-100",
  showButtons = true,
}) {
  return (
    <section className={`${backgroundClass} ${textColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
          <p className={`text-xl md:text-2xl mb-8 ${subtitleColor}`}>
            {subtitle}
          </p>
          {showButtons && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={primaryButton.href}
                className="bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-300 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {primaryButton.text}
              </Link>
              <Link
                href={secondaryButton.href}
                className="border-2 border-white dark:border-gray-300 text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 dark:hover:bg-gray-800 dark:hover:text-purple-300 transition-colors"
              >
                {secondaryButton.text}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
