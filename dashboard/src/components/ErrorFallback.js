import React from 'react';
import * as Sentry from '@sentry/react';

function ErrorFallback({ error, componentStack, resetError }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h1>
          
          <p className="text-gray-400 mb-6">
            We're sorry for the inconvenience. The error has been reported to our team.
          </p>

          {process.env.NODE_ENV === 'development' && error && (
            <div className="bg-gray-900 rounded p-4 mb-6 text-left">
              <p className="text-red-400 text-sm font-mono mb-2">{error.toString()}</p>
              {componentStack && (
                <pre className="text-gray-500 text-xs overflow-auto max-h-48">
                  {componentStack}
                </pre>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={resetError}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Go Home
            </button>
            <button
              onClick={() => {
                Sentry.showReportDialog({
                  eventId: Sentry.lastEventId(),
                });
              }}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Report Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorFallback;
