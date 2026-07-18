import React from 'react';

export const StandardIcon = ({ className = "", strokeWidth = 1.5 }: { className?: string, strokeWidth?: number | string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 5V12.05C4 15.08 5.71 17.85 8.42 19.21L12 21L15.58 19.21C18.29 17.85 20 15.08 20 12.05V5L19.3 5.08C16.85 5.35 14.39 4.71 12.39 3.28L12 3L11.61 3.28C9.61 4.71 7.15 5.35 4.7 5.08L4 5Z"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"/>
    <path d="M12 6.2L17 8.15V11.7C17 14.2 15.45 16.3 12 18C8.55 16.3 7 14.2 7 11.7V8.15L12 6.2Z"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"/>
  </svg>
);
