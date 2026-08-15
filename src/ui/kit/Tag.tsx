import type { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
  tone?: 'neutral' | 'seal' | 'brass' | 'union' | 'flag';
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<TagProps['tone']>, string> = {
  neutral: 'border-rule text-paper/70',
  seal: 'border-seal text-seal',
  brass: 'border-brass text-brass',
  union: 'border-union text-union',
  flag: 'border-flag text-flag',
};

/** A small rectangular label — the theme has no pills or rounded badges. */
export function Tag({ children, tone = 'neutral', className = '' }: TagProps) {
  return (
    <span className={`inline-block rounded-none border px-1.5 py-0.5 font-mono text-[11px] ${TONE_CLASSES[tone]} ${className}`}>
      {children}
    </span>
  );
}
