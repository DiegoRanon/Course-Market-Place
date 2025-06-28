"use client";

export default function TextField({
  id,
  name,
  type = "text",
  label,
  value,
  placeholder,
  onChange,
  onBlur,
  error,
  required = false,
  autoComplete,
  className = "",
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && (
            <span className="text-red-500 dark:text-red-400 ml-1">*</span>
          )}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`appearance-none block w-full px-3 py-2 border ${
          error
            ? "border-red-300 dark:border-red-700"
            : "border-gray-300 dark:border-gray-700"
        } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
        bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
        focus:outline-none focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 sm:text-sm`}
        aria-label={label || name}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
