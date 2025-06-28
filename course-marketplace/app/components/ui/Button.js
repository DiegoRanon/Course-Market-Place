"use client";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  isLoading = false,
  className = "",
  onClick,
  ...props
}) {
  // Base button styles
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors";

  // Size variations
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  // Variant styles (colors)
  const variantStyles = {
    primary:
      "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-purple-600 dark:focus:ring-offset-gray-900",
    secondary:
      "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-600 dark:focus:ring-offset-gray-900",
    success:
      "bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-green-600 dark:focus:ring-offset-gray-900",
    danger:
      "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-600 dark:focus:ring-offset-gray-900",
    outline:
      "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-purple-600 dark:focus:ring-offset-gray-900",
  };

  // Disabled styles
  const disabledStyles = "opacity-50 cursor-not-allowed";

  // Compile classes
  const buttonClasses = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${disabled || isLoading ? disabledStyles : ""}
    ${className}
  `;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={buttonClasses}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
}
