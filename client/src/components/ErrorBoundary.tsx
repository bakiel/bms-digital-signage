import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

/**
 * Custom ErrorBoundary component for BMS Digital Signage
 * Provides a fallback UI when components throw errors
 */
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  // Error fallback component
  const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-6">
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-lg text-center">
        <h3 className="text-xl font-bold mb-2">Something went wrong</h3>
        <p className="mb-4">{error.message}</p>
        <button 
          onClick={resetErrorBoundary}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </div>
  );

  // Log error details
  const logError = (error: Error, info: React.ErrorInfo) => {
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', info.componentStack);
    
    // Here you could also send the error to a logging service
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={() => {
        // Reset application state here if needed
        console.log('ErrorBoundary reset');
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;