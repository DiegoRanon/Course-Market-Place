export default function ErrorState({ 
  title = "Error", 
  message = "There was an error. Please try again later.", 
  details = null, 
  onRetry = null 
}) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">{title}</h2>
        <p className="text-gray-600">{message}</p>
        {details && <p className="text-sm text-gray-500 mt-2">{details}</p>}
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
} 