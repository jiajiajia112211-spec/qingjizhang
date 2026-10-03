import { motion } from 'framer-motion';
import { useId } from 'react';

interface Option<V extends string> {
  value: V;
  label: string;
}

interface SegmentedControlProps<V extends string> {
  options: Array<Option<V>>;
  value: V;
  onChange: (v: V) => void;
  className?: string;
}

/** iOS 分段控件：白色滑块跟随动画 */
export function SegmentedControl<V extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<V>) {
  const layoutId = useId();
  return (
    <div
      className={`flex rounded-[9px] bg-black/[0.06] p-[2px] dark:bg-white/[0.08] ${className}`}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="relative min-h-[32px] flex-1 rounded-[7px] px-2 text-[13px] font-medium leading-[18px] transition-colors"
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-[7px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] dark:bg-[#636366]"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              />
            )}
            <span
              className={`relative z-10 ${
                active
                  ? 'text-ios-label dark:text-white'
                  : 'text-ios-secondary dark:text-[#AEAEB2]'
              }`}
            >
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
