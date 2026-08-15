import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface SigningFlourishProps {
  docket: string;
  title: string;
  onComplete: () => void;
}

/**
 * The signing moment — the single most memorable interaction in the game.
 * The document rises from the desk edge, a signature draws itself along an
 * SVG path (stroke-dashoffset, 900ms ease-out), then a brass seal stamps
 * down from scale 1.15 with a 60ms settle. Used ONLY here — nothing else in
 * the app animates past 200ms.
 */
export function SigningFlourish({ docket, title, onComplete }: SigningFlourishProps) {
  const reducedMotion = usePrefersReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const [risen, setRisen] = useState(false);
  const [sealVisible, setSealVisible] = useState(false);
  const [sealSettled, setSealSettled] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      onComplete();
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const raf: number[] = [];

    // 1. Rise from the desk edge.
    raf.push(requestAnimationFrame(() => setRisen(true)));

    // 2. Draw the signature (900ms), starting once the document has risen.
    timers.push(
      setTimeout(() => {
        const path = pathRef.current;
        if (path) {
          const length = path.getTotalLength();
          path.style.strokeDasharray = `${length}`;
          path.style.strokeDashoffset = `${length}`;
          raf.push(
            requestAnimationFrame(() => {
              path.style.transition = 'stroke-dashoffset 900ms ease-out';
              path.style.strokeDashoffset = '0';
            }),
          );
        }
      }, 620),
    );

    // 3. Stamp the seal: mount oversized, then settle to scale(1) in 60ms.
    timers.push(
      setTimeout(() => {
        setSealVisible(true);
        raf.push(requestAnimationFrame(() => setSealSettled(true)));
      }, 620 + 900),
    );

    // 4. Hold the finished document briefly, then hand back control.
    timers.push(setTimeout(onComplete, 620 + 900 + 60 + 700));

    return () => {
      timers.forEach(clearTimeout);
      raf.forEach(cancelAnimationFrame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/80 pb-16">
      <div
        className="w-full max-w-md border-l-2 border-seal bg-parchment p-6 text-[#1a1a1a] transition-transform duration-[600ms] ease-out"
        style={{ transform: risen ? 'translateY(0)' : 'translateY(120%)' }}
      >
        <p className="font-mono text-[11px] tracking-wide text-[#1a1a1a]/60">{docket}</p>
        <h3 className="mt-1 font-display text-h3">{title}</h3>

        <div className="relative mt-6 flex h-20 items-center justify-center border-t border-[#1a1a1a]/15 pt-4">
          <svg width="220" height="60" viewBox="0 0 220 60" fill="none">
            <path
              ref={pathRef}
              d="M8,42 C22,10 30,52 44,30 C54,14 60,46 74,34 C86,24 92,44 106,28 C118,14 124,44 140,32 C152,22 158,40 172,30 C184,20 192,34 208,24"
              stroke="#1a1a1a"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {sealVisible && (
            <div
              className="absolute right-2 top-0 flex h-14 w-14 items-center justify-center rounded-full border-2 border-brass font-display text-[10px] uppercase tracking-widest text-brass transition-transform duration-[60ms] ease-out"
              style={{ transform: sealSettled ? 'scale(1)' : 'scale(1.15)' }}
            >
              Sealed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
