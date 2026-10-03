import { useEffect, useState } from 'react';
import { Sheet } from '../ui/Sheet';
import { Numpad } from './Numpad';
import { evalExpr, formatExpression, formatMoney } from '../../utils/format';

interface AmountSheetProps {
  open: boolean;
  title: string;
  /** 初始表达式（如已设预算金额） */
  initial?: string;
  /** 展示「清除」按钮（用于取消分类预算） */
  allowClear?: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
}

/** 通用金额编辑弹窗（预算设置等场景），复用数字键盘 */
export function AmountSheet({
  open,
  title,
  initial = '',
  allowClear,
  onClose,
  onConfirm,
}: AmountSheetProps) {
  const [expr, setExpr] = useState(initial);

  useEffect(() => {
    if (open) setExpr(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const amount = evalExpr(expr);
  const canSave = amount > 0 && amount <= 99999999;

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="pb-safe">
        <h3 className="pb-1 text-center text-[17px] font-semibold text-ios-label dark:text-white">
          {title}
        </h3>
        {allowClear && (
          <div className="flex justify-center pb-1">
            <button
              className="text-[13px] text-ios-red active:opacity-60"
              onClick={() => {
                onConfirm(0);
                onClose();
              }}
            >
              清除该预算
            </button>
          </div>
        )}
        <div className="flex items-baseline justify-end px-5 pb-1">
          <span className="text-[30px] font-semibold tracking-tight text-ios-label dark:text-white">
            {formatExpression(expr) || '0'}
          </span>
        </div>
        <Numpad
          expr={expr}
          onChange={setExpr}
          onSave={() => {
            onConfirm(amount);
            onClose();
          }}
          saveDisabled={!canSave}
        />
      </div>
    </Sheet>
  );
}
