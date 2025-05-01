import React from 'react';

const UniversityLogo: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-edu-primary text-white">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="w-6 h-6"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
      </svg>
    </div>
  );
};

export default UniversityLogo;
