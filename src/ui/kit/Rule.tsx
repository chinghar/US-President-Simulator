/** A 1px hairline divider — the only way sections are separated. No shadows. */
export function Rule({ className = '' }: { className?: string }) {
  return <hr className={`border-0 border-t border-rule ${className}`} />;
}
