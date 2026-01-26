
import React from 'react';

interface IconProps {
  className?: string;
}

export const ChestIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 15c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zM32 30c-2.2 0-4 1.8-4 4v10c0 1.1.9 2 2 2h4l2 12-4 15c-.3.9.2 1.9 1.1 2.2.9.3 1.9-.2 2.2-1.1L39 60h22l3.3 12.1c.3.9 1.3 1.4 2.2 1.1.9-.3 1.4-1.3 1.1-2.2L63.6 58H66c1.1 0 2-.9 2-2V34c0-2.2-1.8-4-4-4H32zm2 10h28v12c0 2.2-1.8 4-4 4H38c-2.2 0-4-1.8-4-4V40z" opacity="0.4" />
    <path d="M25 45h10v5H25zm40 0h10v5H65z" fill="#ADFF2F" opacity="0.6" />
    <rect x="35" y="38" width="30" height="4" rx="2" fill="#ADFF2F" />
  </svg>
);

export const BackIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 12c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zM30 30l5 25 15-5 15 5 5-25H30zm10 40c-2 0-4 2-4 4v20h28v-20c0-2-2-4-4-4h-20z" opacity="0.4" />
    <path d="M35 32c-2 4-2 10 0 14m30-14c2 4 2 10 0 14" stroke="#ADFF2F" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
    <path d="M45 35h10l-2 15h-6z" fill="#ADFF2F" />
  </svg>
);

export const ShoulderIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 15c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zM25 35l10-10 15 5 15-5 10 10-5 25h-40l-5-25zM40 70v25h20v-25H40z" opacity="0.4" />
    <circle cx="25" cy="25" r="5" fill="#ADFF2F" />
    <circle cx="75" cy="25" r="5" fill="#ADFF2F" />
    <path d="M30 30L25 25M70 30L75 25" stroke="#ADFF2F" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const LegIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M60 10c-3 0-5 2-5 5s2 5 5 5 5-2 5-5-2-5-5-5zM45 25h20l5 15-15 15v15l15 25h-10l-10-20-10 20h-10l15-30V55L40 25h5z" opacity="0.4" />
    <path d="M48 60q5 10 0 25m14-25q-5 10 0 25" stroke="#ADFF2F" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
    <rect x="42" y="22" width="26" height="6" rx="3" fill="#ADFF2F" />
  </svg>
);

export const DeadliftIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M70 20c-3 0-5 2-5 5s2 5 5 5 5-2 5-5-2-5-5-5zM30 40h30l15 15-10 35H55L45 65l-10 25H20l10-50z" opacity="0.4" />
    <rect x="15" y="85" width="70" height="4" rx="2" fill="#ADFF2F" />
    <circle cx="15" cy="87" r="6" fill="#ADFF2F" opacity="0.6" />
    <circle cx="85" cy="87" r="6" fill="#ADFF2F" opacity="0.6" />
  </svg>
);

export const ArmIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10c-3 0-5 2-5 5s2 5 5 5 5-2 5-5-2-5-5-5zM40 25h20l15 15-5 10-15-5v45H40V45l-15 5-5-10 20-15z" opacity="0.4" />
    <path d="M30 40a10 10 0 0 1 10-10" stroke="#ADFF2F" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M70 40a10 10 0 0 0-10-10" stroke="#ADFF2F" strokeWidth="4" strokeLinecap="round" fill="none" />
  </svg>
);

export const CoreIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M20 70c-3 0-5-2-5-5s2-5 5-5 5 2 5 5-2 5-5 5zM35 60h40l10-10-5-10H50L30 50l5 10zM30 80h50v10H30v-10z" opacity="0.4" />
    <path d="M45 55q10-10 20 0" stroke="#ADFF2F" strokeWidth="4" strokeLinecap="round" fill="none" />
    <rect x="45" y="58" width="20" height="4" rx="2" fill="#ADFF2F" opacity="0.5" />
  </svg>
);

export const GenericIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <circle cx="50" cy="20" r="8" opacity="0.4" />
    <path d="M30 35h40l5 25-10 5-5-15h-20l-5 15-10-5 5-25zM40 70v25h20v-25H40z" opacity="0.4" />
    <path d="M50 40l-2 15h4z" fill="#ADFF2F" />
  </svg>
);
