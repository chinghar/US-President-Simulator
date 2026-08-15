import type { IssueAxisInfo } from '../../data/issues';

interface AxisSliderProps {
  issue: IssueAxisInfo;
  value: number;
  onChange: (value: number) => void;
}

export function AxisSlider({ issue, value, onChange }: AxisSliderProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-small">
        <span className="font-medium text-paper">{issue.name}</span>
        <span className="font-mono text-paper/60">{value > 0 ? `+${value}` : value}</span>
      </div>
      <input
        type="range"
        min={-100}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--seal)]"
        aria-label={issue.name}
      />
      <div className="flex justify-between text-[11px] text-paper/40">
        <span>{issue.leftLabel}</span>
        <span>{issue.rightLabel}</span>
      </div>
    </div>
  );
}
