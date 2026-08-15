import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

/** Every number change counts up over 400ms with tabular figures, so digits
 * never reflow. Respects prefers-reduced-motion by jumping straight to the
 * final value. */
export function AnimatedNumber({ value, decimals = 0, suffix = '', prefix = '', className = '' }: AnimatedNumberProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const duration = 400;
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 2); // ease-out
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reducedMotion]);

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
