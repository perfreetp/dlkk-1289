import { cn } from '@/utils/export';

interface Props {
  value: number;
  max?: number;
  color?: 'sun' | 'mint' | 'rose' | 'ink';
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const COLOR_MAP = {
  sun: 'bg-gradient-to-r from-sun-400 to-sun-500',
  mint: 'bg-gradient-to-r from-mint-400 to-mint-500',
  rose: 'bg-gradient-to-r from-rose-400 to-rose-500',
  ink: 'bg-gradient-to-r from-ink-700 to-ink-900',
};

export default function ProgressBar({
  value,
  max = 100,
  color = 'sun',
  showLabel = true,
  size = 'md',
  className,
}: Props) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs font-medium text-ink-500 mb-1.5">
          <span>匹配度</span>
          <span className="text-ink-900 font-semibold">{value}%</span>
        </div>
      )}
      <div className={cn('progress-bar', size === 'sm' && 'h-1')}>
        <div
          className={cn('progress-fill', COLOR_MAP[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
