export default function GauntletIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="6" fill="#0d1117" />
      <rect x="3" y="22" width="5" height="8" rx="1" fill="#0369a1" />
      <rect x="10" y="15" width="5" height="15" rx="1" fill="#0284c7" />
      <rect x="17" y="8" width="5" height="22" rx="1" fill="#0ea5e9" />
      <rect x="24" y="2" width="5" height="28" rx="1" fill="#38bdf8" />
    </svg>
  );
}
