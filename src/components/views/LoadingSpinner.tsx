import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      {/* Spinner animation */}
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      
      {/* Loading text */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-900">
          Generuję fiszki...
        </h3>
        <p className="text-sm text-gray-600">
          AI analizuje Twój tekst i tworzy propozycje fiszek. To może potrwać kilka sekund.
        </p>
      </div>

      {/* Progress dots animation */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;