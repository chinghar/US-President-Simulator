import type { ReactNode } from 'react';

interface DocketDocumentProps {
  docket: string;
  title: string;
  children: ReactNode;
  className?: string;
}

/** A federal document laid on the desk — paper surface, dark text, 2px seal
 * left edge, and a real monospace docket line at top. Used for bills,
 * executive orders, and crisis briefings. */
export function DocketDocument({ docket, title, children, className = '' }: DocketDocumentProps) {
  return (
    <div className={`border-l-2 border-seal bg-parchment p-4 text-[#1a1a1a] ${className}`}>
      <p className="font-mono text-[11px] tracking-wide text-[#1a1a1a]/60">{docket}</p>
      <h3 className="mt-1 font-display text-h3 text-[#1a1a1a]">{title}</h3>
      <div className="mt-2 space-y-2 font-sans text-small text-[#1a1a1a]/85">{children}</div>
    </div>
  );
}
