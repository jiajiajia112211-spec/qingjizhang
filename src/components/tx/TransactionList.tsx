import { formatMoney } from '../../utils/format';
import { useStore } from '../../store/useStore';
import { SwipeableRow } from '../ui/SwipeableRow';
import { TransactionRow } from './TransactionRow';
import type { DayGroup } from '../../utils/tx';
import type { Transaction } from '../../types';

interface TransactionListProps {
  groups: DayGroup[];
  selectionMode?: boolean;
  selectedIds?: string[];
  onToggle?: (tx: Transaction) => void;
  onLongPress?: (tx: Transaction) => void;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
}

/** 按日分组的交易列表：组头显示日期与当日收支，行支持左滑与长按 */
export function TransactionList({
  groups,
  selectionMode = false,
  selectedIds = [],
  onToggle,
  onLongPress,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const currency = useStore((s) => s.settings.currency);

  return (
    <div className="space-y-1">
      {groups.map((g) => (
        <section key={g.date}>
          <header className="flex items-baseline justify-between px-5 pb-1.5 pt-3">
            <span className="text-[13px] font-semibold text-ios-label dark:text-white">
              {g.label}
            </span>
            <span className="text-[12px] text-ios-secondary dark:text-[#98989F]">
              {g.expense > 0 && <span className="ml-2">支 {formatMoney(g.expense, currency)}</span>}
              {g.income > 0 && <span className="ml-2">收 {formatMoney(g.income, currency)}</span>}
            </span>
          </header>
          <div className="mx-4 overflow-hidden rounded-card bg-white dark:bg-ios-darkcard">
            {g.items.map((tx) => (
              <div
                key={tx.id}
                className="border-b-[0.5px] border-ios-separator last:border-0 dark:border-white/[0.12]"
              >
                <SwipeableRow
                  disabled={selectionMode}
                  onEdit={onEdit ? () => onEdit(tx) : undefined}
                  onDelete={onDelete ? () => onDelete(tx) : undefined}
                >
                  <TransactionRow
                    tx={tx}
                    selectionMode={selectionMode}
                    selected={selectedIds.includes(tx.id)}
                    onToggle={() => onToggle?.(tx)}
                    onLongPress={() => onLongPress?.(tx)}
                  />
                </SwipeableRow>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
