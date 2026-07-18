import React from 'react';

export const StandardIcon = ({ className = "", strokeWidth = 2 }: { className?: string, strokeWidth?: number | string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2.5L19.5 6.75V17.25L12 21.5L4.5 17.25V6.75L12 2.5Z"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"/>
    <path d="M12 8L15.5 10V14L12 16L8.5 14V10L12 8Z"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"/>
  </svg>
);
