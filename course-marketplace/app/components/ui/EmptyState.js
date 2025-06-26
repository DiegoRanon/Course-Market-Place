export default function EmptyState({ 
  title = "No items found", 
  message = "No items available.", 
  action = null,
  actionText = "Add New"
}) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600">{message}</p>
        
        {action && (
          <button
            onClick={action}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
} 