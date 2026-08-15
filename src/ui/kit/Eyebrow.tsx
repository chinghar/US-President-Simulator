import type { ReactNode } from 'react';

/** Public Sans 12px, uppercase, 0.12em tracking, --rule colored. */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-eyebrow font-sans uppercase tracking-[0.12em] text-rule ${className}`}>{children}</p>;
}
