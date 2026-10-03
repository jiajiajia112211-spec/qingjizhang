import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

/** 空状态：图标 + 文案 + 可选操作按钮 */
export function EmptyState({ icon: Icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="no-select flex flex-col items-center px-8 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ios-blue/10 dark:bg-ios-blue/20">
        <Icon className="h-9 w-9 text-ios-blue" strokeWidth={1.6} />
      </div>
      <p className="mt-4 text-[16px] font-semibold text-ios-label dark:text-white">{title}</p>
      {subtitle && (
        <p className="mt-1 text-[13px] leading-5 text-ios-secondary dark:text-[#AEAEB2]">
          {subtitle}
        </p>
      )}
      {action && (
        <button
          className="mt-5 rounded-btn bg-ios-blue px-5 py-2.5 text-[15px] font-semibold text-white transition active:scale-95 active:opacity-80"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
