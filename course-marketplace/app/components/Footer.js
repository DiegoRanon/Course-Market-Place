import Link from "next/link";

export default function Footer({
  companyName = "CourseMarket",
  companyDescription = "Empowering learners worldwide with quality education and expert-led courses.",
  companyColor = "text-purple-400",
  sections = [
    {
      title: "Categories",
      links: [
        { text: "Programming", href: "#" },
        { text: "Design", href: "#" },
        { text: "Business", href: "#" },
        { text: "Marketing", href: "#" }
      ]
    },
    {
      title: "Company",
      links: [
        { text: "About Us", href: "/about" },
        { text: "Contact", href: "/contact" },
        { text: "Pricing", href: "/pricing" },
        { text: "Careers", href: "/careers" }
      ]
    },
    {
      title: "Support",
      links: [
        { text: "Help Center", href: "/help" },
        { text: "Contact Support", href: "/contact" },
        { text: "Privacy Policy", href: "/privacy" },
        { text: "Terms of Service", href: "/terms" }
      ]
    }
  ],
  backgroundClass = "bg-gray-900",
  textColor = "text-white",
  linkColor = "text-gray-400",
  linkHoverColor = "hover:text-white",
  gridCols = "grid-cols-1 md:grid-cols-4",
  padding = "py-12",
  copyrightText = "© 2024 CourseMarket. All rights reserved.",
  showCopyright = true
}) {
  return (
    <footer className={`${backgroundClass} ${textColor} ${padding}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid ${gridCols} gap-8`}>
          {/* Company Info */}
          <div>
            <h3 className={`text-2xl font-bold ${companyColor} mb-4`}>
              {companyName}
            </h3>
            <p className={linkColor}>
              {companyDescription}
            </p>
          </div>

          {/* Navigation Sections */}
          {sections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href} 
                      className={`${linkColor} ${linkHoverColor} transition-colors`}
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        {showCopyright && (
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className={linkColor}>{copyrightText}</p>
          </div>
        )}
      </div>
    </footer>
  );
} 