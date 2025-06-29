"use client";

export default function StatsGrid() {
  const stats = [
    { number: "10K+", label: "Students Enrolled" },
    { number: "200+", label: "Expert Instructors" },
    { number: "500+", label: "High-Quality Courses" },
    { number: "95%", label: "Success Rate" },
  ];

  return (
    <div className="bg-primary/5 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center"
              data-testid="stat-item"
            >
              <h3 className="text-4xl font-bold text-primary">{stat.number}</h3>
              <p className="mt-2 text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
