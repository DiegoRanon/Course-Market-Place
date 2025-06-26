export default function LoadingState({ message = "Loading...", size = "large" }) {
  const spinnerSizes = {
    small: "h-6 w-6",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  };

  return (
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center">
        <div 
          className={`animate-spin rounded-full ${spinnerSizes[size]} border-t-2 border-b-2 border-purple-500 mb-4`}
          aria-label="Loading"
        />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
} 