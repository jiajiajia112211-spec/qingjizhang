import { ArrowLeftRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CategoryIcon } from '../../constants/icons';
import { useLongPress } from '../../hooks/useLongPress';
import { formatMoney } from '../../utils/format';
import type { Transaction } from '../../types';

interface TransactionRowProps {
  tx: Transaction;
  onClick?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
  onToggle?: () => void;
  /** 长按进入多选 */
  onLongPress?: () => void;
}

/** 单条交易行：图标 / 标题 / 备注 / 金额，支持多选与长按 */
export function TransactionRow({
  tx,
  onClick,
  selectionMode,
  selected,
  onToggle,
  onLongPress,
}: TransactionRowProps) {
  const currency = useStore((s) => s.settings.currency);
  const category = useStore((s) =>
    tx.categoryId ? s.categories.find((c) => c.id === tx.categoryId) : undefined,
  );
  const fromAcc = useStore((s) => s.accounts.find((a) => a.id === tx.accountId));
  const toAcc = useStore((s) =>
    tx.toAccountId ? s.accounts.find((a) => a.id === tx.toAccountId) : undefined,
  );

  const longPress = useLongPress(() => onLongPress?.());

  // 金额展示规则：支出黑色「-」，收入绿色「+」，转账灰色无符号
  const amountText =
    tx.type === 'expense'
      ? `-${formatMoney(tx.amount, currency)}`
      : tx.type === 'income'
        ? `+${formatMoney(tx.amount, currency)}`
        : formatMoney(tx.amount, currency);
  const amountClass =
    tx.type === 'income'
      ? 'text-ios-green'
      : tx.type === 'transfer'
        ? 'text-ios-secondary dark:text-[#98989F]'
        : 'text-ios-label dark:text-white';

  const title =
    tx.type === 'transfer'
      ? `${fromAcc?.name ?? '?'} → ${toAcc?.name ?? '?'}`
      : (category?.name ?? '未知分类');

  const subtitleParts = [
    tx.note,
    ...(tx.tags.length > 0 ? [tx.tags.map((t) => `#${t}`).join(' ')] : []),
    tx.type === 'transfer' ? '' : (fromAcc?.name ?? ''),
  ].filter(Boolean);

  return (
    <div
      className="flex min-h-[60px] items-center gap-3 px-3 py-2"
      onContextMenu={(e) => e.preventDefault()}
      {...(selectionMode ? {} : longPress)}
      onClick={() => (selectionMode ? onToggle?.() : onClick?.())}
    >
      {/* 多选勾选圈 */}
      {selectionMode && (
        <span
          className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition ${
            selected
              ? 'border-ios-blue bg-ios-blue'
              : 'border-ios-separator dark:border-white/25'
          }`}
        >
          {selected && (
            <span className="h-[10px] w-[10px] rounded-full bg-white" />
          )}
        </span>
      )}

      {/* 分类 / 转账图标 */}
      {tx.type === 'transfer' ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ios-secondary">
          <ArrowLeftRight className="h-5 w-5 text-white" />
        </span>
      ) : (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: category?.color ?? '#8E8E93' }}
        >
          <CategoryIcon name={category?.icon ?? 'other'} className="h-5 w-5 text-white" />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-medium text-ios-label dark:text-white">
          {title}
        </span>
        {subtitleParts.length > 0 && (
          <span className="block truncate text-[12px] text-ios-secondary dark:text-[#98989F]">
            {subtitleParts.join(' · ')}
          </span>
        )}
      </span>

      <span className={`shrink-0 text-[16px] font-semibold tabular-nums ${amountClass}`}>
        {amountText}
      </span>
    </div>
  );
}
