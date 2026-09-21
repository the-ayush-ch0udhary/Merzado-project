import React from 'react';

export const CardSkeleton = () => (
  <div
    className="card"
    style={{
      opacity: 0.7,
      animation: 'pulse 1.5s infinite ease-in-out',
      minHeight: '260px',
    }}
  >
    <div
      style={{
        height: '14px',
        width: '30%',
        backgroundColor: '#e2e8f0',
        borderRadius: '4px',
        marginBottom: '1rem',
      }}
    ></div>
    <div
      style={{
        height: '22px',
        width: '80%',
        backgroundColor: '#e2e8f0',
        borderRadius: '4px',
        marginBottom: '1rem',
      }}
    ></div>
    <div
      style={{
        height: '14px',
        width: '100%',
        backgroundColor: '#f1f5f9',
        borderRadius: '4px',
        marginBottom: '0.5rem',
      }}
    ></div>
    <div
      style={{
        height: '14px',
        width: '60%',
        backgroundColor: '#f1f5f9',
        borderRadius: '4px',
        marginBottom: '1.5rem',
      }}
    ></div>
    <div
      style={{
        height: '60px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        marginBottom: '1rem',
      }}
    ></div>
    <div
      style={{
        height: '36px',
        backgroundColor: '#e2e8f0',
        borderRadius: '8px',
      }}
    ></div>
  </div>
);

export const LoadingGrid = ({ count = 6 }) => (
  <div className="rfq-grid">
    {Array.from({ length: count }).map((_, index) => (
      <CardSkeleton key={index} />
    ))}
  </div>
);
