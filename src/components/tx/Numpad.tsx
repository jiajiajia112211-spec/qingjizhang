import { Delete } from 'lucide-react';
import { pressKey } from '../../utils/format';

interface NumpadProps {
  expr: string;
  onChange: (next: string) => void;
  onSave: () => void;
  saveDisabled?: boolean;
  saveLabel?: string;
}

/** 轻触感反馈：Android 震动 8ms，iOS Safari 不支持时静默跳过 */
function haptic() {
  try {
    if ('vibrate' in navigator) navigator.vibrate(8);
  } catch {
    /* 忽略 */
  }
}

const KEYS: string[][] = [
  ['7', '8', '9', 'del'],
  ['4', '5', '6', '+'],
  ['1', '2', '3', '-'],
  ['.', '0', 'SAVE'],
];

/**
 * iOS 计算器风格数字键盘：支持加减、小数点、删除，右下角保存键。
 * 按压反馈只用 transform/opacity（合成器属性），不触发布局，保证连续输入不掉帧。
 */
export function Numpad({ expr, onChange, onSave, saveDisabled, saveLabel = '保存' }: NumpadProps) {
  const press = (key: string) => {
    haptic();
    if (key === 'SAVE') {
      if (!saveDisabled) onSave();
      return;
    }
    onChange(pressKey(expr, key === 'del' ? 'del' : key));
  };

  return (
    <div className="no-select grid grid-cols-4 gap-1.5 p-3 pb-safe">
      {KEYS.flat().map((key) => {
        if (key === 'SAVE') {
          return (
            <button
              key={key}
              className={`col-span-2 h-[46px] rounded-btn bg-ios-blue text-[17px] font-semibold text-white transition-[transform,opacity] duration-100 active:scale-[0.98] ${
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
            className="flex h-[46px] items-center justify-center rounded-btn bg-black/[0.05] text-[22px] font-medium text-ios-label transition-[transform,opacity] duration-100 active:scale-95 active:opacity-70 dark:bg-white/[0.08] dark:text-white"
            onClick={press.bind(null, key)}
          >
            {key === 'del' ? <Delete className="h-6 w-6" strokeWidth={1.8} /> : key}
          </button>
        );
      })}
    </div>
  );
}
