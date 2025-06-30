import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "My Courses", href: "/dashboard", icon: "📚" },
    { label: "Progress", href: "/dashboard/progress", icon: "📊" },
    { label: "Account", href: "/dashboard/account", icon: "👤" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-4">
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        Dashboard
      </h3>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
