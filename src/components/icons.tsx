// components/icons.tsx — ชุดไอคอน SVG ขนาดเล็กสำหรับ UI

import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

function base(props: P) {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props,
  } as P;
}

export function HomeIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />
    </svg>
  );
}

export function UsersIcon(p: P) {
  return (
    <svg {...base(p)}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6M18 14c2 1 3.5 3 3.5 6" />
    </svg>
  );
}

export function TagIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="7.5" cy="7.5" r="1.2" />
    </svg>
  );
}

export function WalletIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M3 6a2 2 0 0 1 2-2h13v4" />
      <path d="M3 6v12a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5" />
      <path d="M17 13h.01" />
    </svg>
  );
}

export function LogInIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
      <path d="M10 17l5-5-5-5M15 12H3" />
    </svg>
  );
}

export function DumbbellIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M6.5 7v10M17.5 7v10M3 9.5v5M21 9.5v5" />
      <path d="M6.5 9.5v5a2 2 0 0 0 0 4M6.5 9.5a2 2 0 0 1 0-4M17.5 9.5v5a2 2 0 0 1 0 4M17.5 9.5a2 2 0 0 0 0-4" />
    </svg>
  );
}

export function AlertIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
  );
}

export function PlusIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function PencilIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M17 3l4 4L8 20l-5 1 1-5z" />
      <path d="M14.5 6.5l3 3" />
    </svg>
  );
}

export function TrashIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function CheckIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function XIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function ClockIcon(p: P) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function ArrowRightIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function WrenchIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M14.7 6.3a4 4 0 0 0 5 5L13 18a2 2 0 0 1-2.8-2.8l6.7-6.7a4 4 0 0 0-5-5L14 6.3z" />
      <path d="M3 21l6-6" />
    </svg>
  );
}