import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, ChevronRight, Tag, Trash2, X } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { SegmentedControl } from '../ui/SegmentedControl';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { CategoryGrid } from './CategoryGrid';
import { AccountSelectSheet } from './AccountSelectSheet';
import { Numpad } from './Numpad';
import { useStore } from '../../store/useStore';
import { useUIStore } from '../../store/useUIStore';
import { evalExpr, formatExpression, formatMoney } from '../../utils/format';
import { budgetWarning } from '../../utils/budget';
import type { TxType } from '../../types';

const TYPE_OPTIONS = [
  { value: 'expense' as const, label: '支出' },
  { value: 'income' as const, label: '收入' },
  { value: 'transfer' as const, label: '转账' },
];

/**
 * 「记一笔」底部面板：支出 / 收入 / 转账三种模式。
 * 打开时按 editingId（编辑）或 presetType（转账入口）初始化，关闭后重置。
 */
export function AddTransactionSheet() {
  const addSheet = useUIStore((s) => s.addSheet);
  const closeAdd = useUIStore((s) => s.closeAdd);
  const showToast = useUIStore((s) => s.showToast);
  const accounts = useStore((s) => s.accounts);
  const currency = useStore((s) => s.settings.currency);
  const editing = useStore((s) =>
    addSheet.editingId ? s.transactions.find((t) => t.id === addSheet.editingId) : undefined,
  );

  const [type, setType] = useState<TxType>('expense');
  const [expr, setExpr] = useState('');
  const [categoryId, setCategoryId] = useState('food');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [picking, setPicking] = useState<null | 'from' | 'to'>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const open = addSheet.open;

  // 打开时初始化表单
  useEffect(() => {
    if (!open) return;
    const accts = useStore.getState().accounts;
    const e = addSheet.editingId
      ? useStore.getState().transactions.find((t) => t.id === addSheet.editingId)
      : undefined;
    if (e) {
      setType(e.type);
      setExpr(String(e.amount));
      setCategoryId(e.categoryId ?? 'food');
      setAccountId(e.accountId);
      setToAccountId(e.toAccountId ?? accts[1]?.id ?? accts[0]?.id ?? '');
      setDate(e.date);
      setNote(e.note);
      setTagsStr(e.tags.join('，'));
    } else {
      setType(addSheet.presetType ?? 'expense');
      setExpr('');
      setCategoryId('food');
      setAccountId(accts[0]?.id ?? '');
      setToAccountId(accts[1]?.id ?? accts[0]?.id ?? '');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setNote('');
      setTagsStr('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const amount = evalExpr(expr);
  const canSave = amount > 0 && amount <= 99999999;

  const handleSave = () => {
    if (!canSave) {
      showToast('请输入有效金额', { type: 'warn' });
      return;
    }
    if (type === 'transfer' && accountId === toAccountId) {
      showToast('转出与转入不能是同一账户', { type: 'warn' });
      return;
    }
    const tags = tagsStr
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const base = {
      type,
      amount,
      categoryId: type === 'transfer' ? null : categoryId,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : null,
      date,
      note: note.trim(),
      tags,
    };

    const s = useStore.getState();
    if (editing) {
      s.updateTransaction(editing.id, base);
      showToast('已更新');
    } else {
      s.addTransaction(base);
      // 保存后检测预算：优先分类超支，其次总预算
      const warn = budgetWarning(useStore.getState().transactions, s.budget, base, s.categories);
      showToast(warn ? `已保存，${warn}` : '已保存', warn ? { type: 'warn' } : undefined);
    }
    closeAdd();
  };

  const handleDelete = () => {
    if (!editing) return;
    useStore.getState().deleteTransaction(editing.id);
    showToast('已删除', {
      action: {
        label: '撤销',
        run: () => {
          const restored = useStore
            .getState()
            .transactions.find((t) => t.id === editing.id);
          if (!restored)
            useStore.getState().restoreTransactions([{ tx: editing, index: 0 }]);
        },
      },
    });
    closeAdd();
  };

  const categoryName =
    type === 'transfer'
      ? '转账'
      : useStore.getState().categories.find((c) => c.id === categoryId)?.name ?? '';

  const accName = (id: string) => accounts.find((a) => a.id === id)?.name ?? '请选择';

  return (
    <>
      <Sheet open={open} onClose={closeAdd} className="flex max-h-[92vh] flex-col">
        {/* 头部：类型切换 + 关闭 */}
        <div className="flex items-center gap-3 px-4 pb-1">
          <SegmentedControl
            options={TYPE_OPTIONS}
            value={type}
            onChange={setType}
            className="flex-1"
          />
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.06] text-ios-secondary active:opacity-60 dark:bg-white/[0.12]"
            onClick={closeAdd}
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
          {type === 'transfer' ? (
            <div className="mt-2 overflow-hidden rounded-card bg-ios-bg dark:bg-ios-darkcard2">
              <button
                className="flex w-full items-center justify-between border-b-[0.5px] border-ios-separator px-4 py-3 dark:border-white/10"
                onClick={() => setPicking('from')}
              >
                <span className="text-[16px] text-ios-label dark:text-white">转出账户</span>
                <span className="flex items-center text-[16px] text-ios-secondary">
                  {accName(accountId)}
                  <ChevronRight className="ml-1 h-4 w-4 opacity-40" />
                </span>
              </button>
              <button
                className="flex w-full items-center justify-between px-4 py-3"
                onClick={() => setPicking('to')}
              >
                <span className="text-[16px] text-ios-label dark:text-white">转入账户</span>
                <span className="flex items-center text-[16px] text-ios-secondary">
                  {accName(toAccountId)}
                  <ChevronRight className="ml-1 h-4 w-4 opacity-40" />
                </span>
              </button>
            </div>
          ) : (
            <CategoryGrid type={type} value={categoryId} onChange={setCategoryId} />
          )}

          {/* 明细信息：日期 / 备注 / 标签 */}
          <div className="mt-3 overflow-hidden rounded-card bg-ios-bg dark:bg-ios-darkcard2">
            <div className="flex items-center border-b-[0.5px] border-ios-separator px-4 py-2.5 dark:border-white/10">
              <Calendar className="h-[18px] w-[18px] text-ios-secondary" />
              <span className="ml-3 text-[16px] text-ios-label dark:text-white">日期</span>
              <label className="relative ml-auto flex min-h-[32px] items-center text-[16px] text-ios-secondary">
                {date}
                {/* 透明覆盖的原生日期控件 */}
                <input
                  type="date"
                  value={date}
                  max="2100-12-31"
                  onChange={(e) => e.target.value && setDate(e.target.value)}
                  className="absolute inset-0 h-full w-full opacity-0"
                />
              </label>
            </div>
            <div className="flex items-center border-b-[0.5px] border-ios-separator px-4 py-2.5 dark:border-white/10">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="点击填写备注"
                maxLength={50}
                className="min-h-[32px] w-full bg-transparent text-[16px] text-ios-label outline-none placeholder:text-ios-secondary dark:text-white"
              />
            </div>
            <div className="flex items-center px-4 py-2.5">
              <Tag className="h-[18px] w-[18px] shrink-0 text-ios-secondary" />
              <input
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="标签，用逗号分隔"
                maxLength={50}
                className="ml-3 min-h-[32px] w-full bg-transparent text-[16px] text-ios-label outline-none placeholder:text-ios-secondary dark:text-white"
              />
            </div>
          </div>

          {/* 编辑模式提供删除入口 */}
          {editing && (
            <button
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-btn bg-ios-red/10 py-3 text-[16px] font-medium text-ios-red active:opacity-60"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" /> 删除这笔交易
            </button>
          )}
        </div>

        {/* 金额展示 + 数字键盘 */}
        <div className="border-t-[0.5px] border-ios-separator dark:border-white/10">
          <div className="flex items-baseline justify-between px-4 pt-2">
            <span className="text-[13px] text-ios-secondary">{categoryName}</span>
            <div className="text-right">
              <span className="text-[26px] font-semibold tracking-tight text-ios-label dark:text-white">
                {formatExpression(expr) || '0'}
              </span>
              {expr.includes('+') || expr.includes('-') ? (
                <span className="ml-2 text-[14px] text-ios-secondary">
                  = {formatMoney(amount, currency)}
                </span>
              ) : null}
            </div>
          </div>
          <Numpad expr={expr} onChange={setExpr} onSave={handleSave} saveDisabled={!canSave} />
        </div>
      </Sheet>

      {/* 账户选择（转出 / 转入） */}
      <AccountSelectSheet
        open={picking !== null}
        onClose={() => setPicking(null)}
        selectedId={picking === 'to' ? toAccountId : accountId}
        disabledId={picking === 'to' ? accountId : picking === 'from' ? toAccountId : null}
        onSelect={(id) => (picking === 'to' ? setToAccountId(id) : setAccountId(id))}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="删除这笔交易？"
        message="删除后可从 Toast 中撤销。"
        confirmText="删除"
        destructive
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
