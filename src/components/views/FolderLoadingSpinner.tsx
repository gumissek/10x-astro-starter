import React from "react";

const FolderLoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      {/* Main spinner with folder icon */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>

        {/* Inner folder icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
        </div>
      </div>

      {/* Loading text */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">Ładuję szczegóły folderu...</h3>
        <p className="text-sm text-gray-600 max-w-md">
          Pobieram informacje o folderze i jego zawartości. To może potrwać chwilę.
        </p>
      </div>

      {/* Animated progress indicators */}
      <div className="flex space-x-2">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <span>Ładuję folder</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
          <span>Pobieram fiszki</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.6s" }}></div>
          <span>Przygotowuję widok</span>
        </div>
      </div>

      {/* Skeleton placeholder for folder structure */}
      <div className="w-full max-w-md space-y-3 mt-8">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default FolderLoadingSpinner;
