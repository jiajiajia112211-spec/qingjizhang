interface ProgressBarProps {
  /** 0 ~ 1，可大于 1 */
  progress: number;
  color: string;
  className?: string;
}

/** 线性进度条（分类预算） */
export function ProgressBar({ progress, color, className = '' }: ProgressBarProps) {
  const pct = Math.min(Math.max(progress, 0), 1) * 100;
  return (
    <div
      className={`h-1.5 overflow-hidden rounded-full bg-black/[0.08] dark:bg-white/[0.12] ${className}`}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}
