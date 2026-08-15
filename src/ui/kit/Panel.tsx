import type { ReactNode } from 'react';
import { Eyebrow } from './Eyebrow';

interface PanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

/** A raised panel — ink-700 surface, 1px inset border, no shadow, no radius
 * above 2px. Sections within are separated by hairline Rules, never boxes. */
export function Panel({ children, className = '', title }: PanelProps) {
  return (
    <div className={`space-y-3 rounded border border-rule bg-ink-700 p-4 ${className}`}>
      {title && <Eyebrow>{title}</Eyebrow>}
      {children}
    </div>
  );
}
