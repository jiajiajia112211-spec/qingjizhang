import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { Page } from '../components/layout/Page';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { FilterSheet } from '../components/tx/FilterSheet';
import { TransactionList } from '../components/tx/TransactionList';
import { useStore } from '../store/useStore';
import { useUIStore } from '../store/useUIStore';
import { countActiveFilters, filterTransactions, groupByDay, sortTxnsDesc } from '../utils/tx';
import { formatMoney } from '../utils/format';
import type { DeletedItem, Transaction, TxFilter } from '../types';
import { ReceiptText } from 'lucide-react';

/** 明细页：搜索 + 多维筛选 + 按日分组 + 左滑编辑删除 + 长按多选 */
export function TransactionsPage() {
  const transactions = useStore((s) => s.transactions);
  const currency = useStore((s) => s.settings.currency);
  const openAdd = useUIStore((s) => s.openAdd);
  const showToast = useUIStore((s) => s.showToast);

  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState<TxFilter>({ ...emptyFilter, keyword: '' });
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmBatch, setConfirmBatch] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<DeletedItem[]>([]);

  const activeCount = countActiveFilters(filter);

  const groups = useMemo(() => {
    const filtered = filterTransactions(
      transactions,
      { ...filter, keyword },
      useStore.getState().categories,
      useStore.getState().accounts,
    );
    return groupByDay(filtered);
  }, [transactions, filter, keyword]);

  const filteredTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const g of groups) {
      income += g.income;
      expense += g.expense;
    }
    return { income, expense };
  }, [groups]);

  // ---- 多选 ----
  const enterSelection = (firstId?: string) => {
    setSelectionMode(true);
    setSelectedIds(firstId ? [firstId] : []);
  };
  const toggle = (tx: Transaction) =>
    setSelectedIds((ids) =>
      ids.includes(tx.id) ? ids.filter((i) => i !== tx.id) : [...ids, tx.id],
    );

  // ---- 删除（带撤销 Toast）----
  const deleteWithUndo = (items: DeletedItem[]) => {
    if (items.length === 0) return;
    setLastDeleted(items);
    showToast(items.length === 1 ? '已删除 1 笔交易' : `已删除 ${items.length} 笔交易`, {
      action: {
        label: '撤销',
        run: () => useStore.getState().restoreTransactions(lastDeletedRef.current),
      },
    });
  };

  // 借助 ref 保证 Toast 回调拿到最新的删除列表
  const lastDeletedRef = useMemo(() => ({ current: [] as DeletedItem[] }), []);
  lastDeletedRef.current = lastDeleted;

  const deleteSingle = (tx: Transaction) => {
    const removed = useStore.getState().deleteTransaction(tx.id);
    if (removed) deleteWithUndo([removed]);
  };

  const deleteSelected = () => {
    const removed = useStore.getState().deleteTransactions(selectedIds);
    setSelectionMode(false);
    setSelectedIds([]);
    deleteWithUndo(removed);
  };

  return (
    <Page title="明细" large tabPadding>
      {/* 多选模式工具条 */}
      {selectionMode ? (
        <div className="mx-4 mb-1 flex items-center justify-between rounded-card bg-white px-4 py-2.5 dark:bg-ios-darkcard">
          <button
            className="text-[15px] text-ios-blue active:opacity-60"
            onClick={() => setSelectedIds(groups.flatMap((g) => g.items.map((t) => t.id)))}
          >
            全选
          </button>
          <span className="text-[15px] font-semibold text-ios-label dark:text-white">
            已选 {selectedIds.length} 项
          </span>
          <button
            className="flex items-center gap-1 text-[15px] text-ios-red disabled:opacity-40 active:opacity-60"
            disabled={selectedIds.length === 0}
            onClick={() => setConfirmBatch(true)}
          >
            <Trash2 className="h-4 w-4" /> 删除
          </button>
        </div>
      ) : (
        /* 搜索 + 筛选 */
        <div className="flex gap-2 px-4 pb-2">
          <div className="flex h-9 flex-1 items-center gap-2 rounded-[10px] bg-black/[0.06] px-3 dark:bg-white/[0.08]">
            <Search className="h-4 w-4 shrink-0 text-ios-secondary" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索备注 / 标签 / 分类"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-ios-label outline-none placeholder:text-ios-secondary dark:text-white"
            />
            {keyword && (
              <button onClick={() => setKeyword('')} aria-label="清空搜索">
                <X className="h-4 w-4 text-ios-secondary" />
              </button>
            )}
          </div>
          <button
            className="relative flex h-9 w-11 items-center justify-center rounded-[10px] bg-black/[0.06] text-ios-label active:opacity-60 dark:bg-white/[0.08] dark:text-white"
            onClick={() => setFilterOpen(true)}
            aria-label="筛选"
          >
            <SlidersHorizontal className="h-[18px] w-[18px]" />
            {activeCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ios-blue px-1 text-[10px] font-semibold text-white">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* 汇总条 */}
      {groups.length > 0 && (
        <p className="px-5 pb-1 text-[12px] text-ios-secondary dark:text-[#98989F]">
          共 {groups.reduce((n, g) => n + g.items.length, 0)} 笔 · 收入{' '}
          {formatMoney(filteredTotals.income, currency)} · 支出{' '}
          {formatMoney(filteredTotals.expense, currency)}
        </p>
      )}

      {/* 列表 */}
      {groups.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={transactions.length === 0 ? '暂无交易记录' : '没有符合条件的交易'}
          subtitle={
            transactions.length === 0
              ? '从首页或底部「+」记下第一笔吧'
              : '试试调整搜索关键词或筛选条件'
          }
        />
      ) : (
        <TransactionList
          groups={groups}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggle={toggle}
          onLongPress={(tx) => enterSelection(tx.id)}
          onEdit={(tx) => openAdd({ editingId: tx.id })}
          onDelete={deleteSingle}
        />
      )}

      {/* 退出多选的悬浮按钮 */}
      {selectionMode && (
        <button
          className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] left-1/2 z-40 flex h-10 -translate-x-1/2 items-center gap-1 rounded-full bg-[#1C1C1E]/90 px-5 text-[14px] font-medium text-white shadow-lg backdrop-blur active:opacity-70"
          onClick={() => {
            setSelectionMode(false);
            setSelectedIds([]);
          }}
        >
          <X className="h-4 w-4" /> 取消多选
        </button>
      )}

      <FilterSheet
        open={filterOpen}
        value={filter}
        onChange={(f) => {
          setFilter(f);
          // 重置为默认筛选时，同步清空搜索关键词
          if (JSON.stringify(f) === JSON.stringify(emptyFilter)) setKeyword('');
        }}
        onClose={() => setFilterOpen(false)}
      />

      <ConfirmDialog
        open={confirmBatch}
        title={`删除 ${selectedIds.length} 笔交易？`}
        message="删除后可在 Toast 中撤销。"
        confirmText="删除"
        destructive
        onConfirm={deleteSelected}
        onClose={() => setConfirmBatch(false)}
      />
    </Page>
  );
}

const emptyFilter: TxFilter = {
  keyword: '',
  type: 'all',
  categoryIds: [],
  accountIds: [],
  minAmount: null,
  maxAmount: null,
  from: null,
  to: null,
};
