import { Delete } from 'lucide-react';
import { pressKey } from '../../utils/format';

interface NumpadProps {
  expr: string;
  onChange: (next: string) => void;
  onSave: () => void;
  saveDisabled?: boolean;
  saveLabel?: string;
}

const KEYS: string[][] = [
  ['7', '8', '9', 'del'],
  ['4', '5', '6', '+'],
  ['1', '2', '3', '-'],
  ['.', '0', 'SAVE'],
];

/** iOS 计算器风格数字键盘：支持加减、小数点、删除，右下角保存键 */
export function Numpad({ expr, onChange, onSave, saveDisabled, saveLabel = '保存' }: NumpadProps) {
  const press = (key: string) => {
    if (key === 'SAVE') {
      if (!saveDisabled) onSave();
      return;
    }
    if (key === 'del') {
      onChange(pressKey(expr, 'del'));
      return;
    }
    onChange(pressKey(expr, key));
  };

  return (
    <div className="no-select grid grid-cols-4 gap-1.5 p-3 pb-safe">
      {KEYS.flat().map((key) => {
        if (key === 'SAVE') {
          return (
            <button
              key={key}
              className={`col-span-2 h-[46px] rounded-btn bg-ios-blue text-[17px] font-semibold text-white transition active:opacity-60 ${
                saveDisabled ? 'opacity-40' : ''
              }`}
              onClick={press.bind(null, key)}
            >
              {saveLabel}
            </button>
          );
        }
        const label = key === 'del' ? '删除' : key === '+' ? '加' : key === '-' ? '减' : key;
        return (
          <button
            key={key}
            aria-label={label}
            className="flex h-[46px] items-center justify-center rounded-btn bg-black/[0.05] text-[22px] font-medium text-ios-label transition active:opacity-50 dark:bg-white/[0.08] dark:text-white"
            onClick={press.bind(null, key)}
          >
            {key === 'del' ? (
              <Delete className="h-6 w-6" strokeWidth={1.8} />
            ) : (
              key
            )}
          </button>
        );
      })}
    </div>
  );
}
