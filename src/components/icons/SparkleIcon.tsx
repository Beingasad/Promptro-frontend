import React, { useId } from 'react';

interface SparkleIconProps {
  className?: string;
  variant?: 'purple' | 'amber' | 'white' | 'currentColor';
  centerDotColor?: string;
}

export const SparkleIcon: React.FC<SparkleIconProps> = ({
  className = "w-4 h-4 shrink-0",
  variant = 'purple',
  centerDotColor = '#ffffff',
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const gradId = `sparkleGrad-${variant}-${uniqueId}`;

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {variant === 'purple' && (
          <linearGradient id={gradId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="45%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        )}
        {variant === 'amber' && (
          <linearGradient id={gradId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        )}
        {variant === 'white' && (
          <linearGradient id={gradId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        )}
      </defs>
      {/* Primary 4-Pointed Sparkle */}
      <path
        d="M12 2.5L14.2 8.8C14.6 9.9 15.5 10.8 16.6 11.2L22.9 13.4L16.6 15.6C15.5 16 14.6 16.9 14.2 18L12 24.3L9.8 18C9.4 16.9 8.5 16 7.4 15.6L1.1 13.4L7.4 11.2C8.5 10.8 9.4 9.9 9.8 8.8L12 2.5Z"
        fill={variant === 'currentColor' ? 'currentColor' : `url(#${gradId})`}
      />
      {/* Center White Dot */}
      <circle cx="12" cy="13.4" r="1.5" fill={centerDotColor} />
      {/* Secondary Top-Right Mini Sparkle */}
      <path
        d="M19 3L19.8 5.2C20 5.7 20.4 6.1 20.9 6.3L23.1 7.1L20.9 7.9C20.4 8.1 20 8.5 19.8 9L19 11.2L18.2 9C18 8.5 17.6 8.1 17.1 7.9L14.9 7.1L17.1 6.3C17.6 6.1 18 5.7 18.2 5.2L19 3Z"
        fill={variant === 'currentColor' ? 'currentColor' : `url(#${gradId})`}
        opacity="0.9"
      />
    </svg>
  );
};
