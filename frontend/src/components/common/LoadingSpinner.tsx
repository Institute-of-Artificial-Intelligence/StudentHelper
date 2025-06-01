
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  // Map size to actual dimensions
  const spinnerSize = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }[size];

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full ${spinnerSize} border-t-2 border-b-2 border-primary`}></div>
    </div>
  );
};
