// src/components/Logo.jsx
export default function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="10" y="4" width="28" height="40" rx="6" fill="#FFC94A" />
      <rect x="16" y="14" width="16" height="3" rx="1.5" fill="#ffffff" />
      <rect x="16" y="21" width="16" height="3" rx="1.5" fill="#ffffff" />
      <rect x="16" y="28" width="10" height="3" rx="1.5" fill="#ffffff" />
      <circle cx="36" cy="36" r="8" fill="#2B2A26" />
      <path
        d="M33 36l2 2 4-4"
        stroke="#FFC94A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
