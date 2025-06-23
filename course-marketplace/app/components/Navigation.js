import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              CourseMarket
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for anything"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/courses" className="text-gray-700 hover:text-purple-600 font-medium">
              Courses
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-purple-600 font-medium">
              Pricing
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-purple-600 font-medium">
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-700 hover:text-purple-600 font-medium">
              Log in
            </Link>
            <Link href="/signup" className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 