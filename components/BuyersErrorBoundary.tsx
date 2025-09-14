'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';

const BuyersErrorFallback = () => (
  <div style={{
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    margin: '20px'
  }}>
    <h2 style={{ color: '#dc3545', marginBottom: '16px' }}>
      Unable to load buyers
    </h2>
    <p style={{ marginBottom: '24px', color: '#6c757d' }}>
      There was an error loading the buyers list. This might be due to a network issue or server problem.
    </p>
    <div>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
          marginRight: '12px'
        }}
      >
        Refresh Page
      </button>
      <button
        onClick={() => window.history.back()}
        style={{
          padding: '12px 24px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Go Back
      </button>
    </div>
  </div>
);

interface Props {
  children: React.ReactNode;
}

export default function BuyersErrorBoundary({ children }: Props) {
  return (
    <ErrorBoundary fallback={<BuyersErrorFallback />}>
      {children}
    </ErrorBoundary>
  );
}