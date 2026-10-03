import { Check, Wallet } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { useStore } from '../../store/useStore';
import { accountBalance } from '../../utils/balance';
import { formatMoney } from '../../utils/format';
import { CategoryIcon } from '../../constants/icons';

interface AccountSelectSheetProps {
  open: boolean;
  onClose: () => void;
  selectedId: string;
  /** 转账场景禁选的账户（如转出后转入不能同账户） */
  disabledId?: string | null;
  onSelect: (id: string) => void;
}

/** 账户选择弹窗：列表展示账户与实时余额 */
export function AccountSelectSheet({
  open,
  onClose,
  selectedId,
  disabledId,
  onSelect,
}: AccountSelectSheetProps) {
  const accounts = useStore((s) => s.accounts);
  const transactions = useStore((s) => s.transactions);

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="pb-safe">
        <h3 className="px-5 pb-2 text-center text-[17px] font-semibold text-ios-label dark:text-white">
          选择账户
        </h3>
        <div className="px-3 pb-4">
          {accounts.map((a) => {
            const disabled = a.id === disabledId;
            const active = a.id === selectedId;
            return (
              <button
                key={a.id}
                disabled={disabled}
                className="flex w-full items-center gap-3 rounded-btn px-2 py-3 text-left active:bg-black/5 disabled:opacity-40 dark:active:bg-white/10"
                onClick={() => {
                  onSelect(a.id);
                  onClose();
                }}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: a.color }}
                >
                  <CategoryIcon name={a.icon} className="h-5 w-5 text-white" />
                </span>
                <span className="flex-1">
                  <span className="block text-[16px] font-medium text-ios-label dark:text-white">
                    {a.name}
                  </span>
                  <span className="block text-[12px] text-ios-secondary">
                    余额 {formatMoney(accountBalance(transactions, a))}
                  </span>
                </span>
                {active ? (
                  <Check className="h-5 w-5 text-ios-blue" strokeWidth={2.5} />
                ) : (
                  <Wallet className="h-4 w-4 opacity-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}
