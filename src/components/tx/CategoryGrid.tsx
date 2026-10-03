import { Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CategoryIcon } from '../../constants/icons';
import type { TxType } from '../../types';

interface CategoryGridProps {
  type: Exclude<TxType, 'transfer'>;
  value: string;
  onChange: (id: string) => void;
}

/** 分类九宫格（5 列），选中态放大并描边 */
export function CategoryGrid({ type, value, onChange }: CategoryGridProps) {
  const categories = useStore((s) => s.categories).filter((c) => c.type === type);

  return (
    <div className="no-scrollbar max-h-[172px] overflow-y-auto">
      <div className="grid grid-cols-5 gap-y-2 px-2">
        {categories.map((c) => {
          const active = c.id === value;
          return (
            <button
              key={c.id}
              className="flex flex-col items-center gap-1 rounded-btn py-1.5 active:opacity-60"
              onClick={() => onChange(c.id)}
            >
              <span
                className={`relative flex h-[42px] w-[42px] items-center justify-center rounded-full transition ${
                  active ? 'ring-2 ring-ios-blue ring-offset-2 ring-offset-white dark:ring-offset-ios-darkcard' : ''
                }`}
                style={{ backgroundColor: c.color }}
              >
                <CategoryIcon name={c.icon} className="h-[20px] w-[20px] text-white" strokeWidth={2.2} />
                {active && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ios-blue ring-2 ring-white dark:ring-ios-darkcard">
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
                  </span>
                )}
              </span>
              <span
                className={`text-[11px] ${
                  active
                    ? 'font-semibold text-ios-blue'
                    : 'text-ios-secondary dark:text-[#AEAEB2]'
                }`}
              >
                {c.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
