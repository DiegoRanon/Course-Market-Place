export default function PageContainer({
  children,
  title,
  description,
  className = "",
}) {
  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {description && <p className="mt-2 text-lg text-gray-600">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
} 