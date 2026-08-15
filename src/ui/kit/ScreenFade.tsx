import { useEffect, useState, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/** Page transitions are 150ms opacity only — nothing else moves. Keyed by
 * the caller so a screen swap remounts and re-fades. */
export function ScreenFade({ screenKey, children }: { screenKey: string; children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    setVisible(false);
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [screenKey, reducedMotion]);

  return (
    <div key={screenKey} className="transition-opacity duration-150" style={{ opacity: visible ? 1 : 0 }}>
      {children}
    </div>
  );
}
