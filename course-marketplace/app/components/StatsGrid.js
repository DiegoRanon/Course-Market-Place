"use client";

export default function StatsGrid({
  stats = [
    { value: "50K+", label: "Active Students" },
    { value: "500+", label: "Online Courses" },
    { value: "100+", label: "Expert Instructors" },
    { value: "95%", label: "Satisfaction Rate" },
  ],
  backgroundClass = "bg-purple-600",
  textColor = "text-white",
  labelColor = "text-purple-200",
  gridCols = "grid-cols-1 md:grid-cols-4",
  valueSize = "text-4xl",
  labelSize = "text-base",
  spacing = "gap-8",
  padding = "py-16",
  onStatClick = null,
}) {
  const handleStatClick = (stat) => {
    if (onStatClick) {
      onStatClick(stat);
    }
  };

  return (
    <section className={`${padding} ${backgroundClass} ${textColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid ${gridCols} ${spacing} text-center`}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className={
                onStatClick
                  ? "cursor-pointer hover:opacity-80 transition-opacity"
                  : ""
              }
              onClick={() => handleStatClick(stat)}
            >
              <div className={`${valueSize} font-bold mb-2`}>{stat.value}</div>
              <div className={`${labelSize} ${labelColor}`}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
