'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="error-page">
          <div className="error-container">
            <span className="error-icon">⚠️</span>
            <h1 className="error-title">Something went wrong</h1>
            <p className="error-description">
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={() => reset()}
              className="btn-primary"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
