import { memo, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, ChevronRight, Tag, Trash2, X } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { SegmentedControl } from '../ui/SegmentedControl';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { CategoryGrid } from './CategoryGrid';
import { AccountSelectSheet } from './AccountSelectSheet';
import { Numpad } from './Numpad';
import { useStore } from '../../store/useStore';
import { useUIStore, type AddSheetState } from '../../store/useUIStore';
import { evalExpr, formatExpression, formatMoney } from '../../utils/format';
import { budgetWarning } from '../../utils/budget';
import type { TxType } from '../../types';

const TYPE_OPTIONS = [
  { value: 'expense' as const, label: '支出' },
  { value: 'income' as const, label: '收入' },
  { value: 'transfer' as const, label: '转账' },
];

/** 表单受控部分：低频变更（打开 / 切类型 / 选分类 / 选账户 / 改日期） */
interface FormState {
  type: TxType;
  categoryId: string;
  accountId: string;
  toAccountId: string;
  date: string;
}

function makeForm(sheet: AddSheetState): FormState {
  const st = useStore.getState();
  const accts = st.accounts;
  if (sheet.editingId) {
    const e = st.transactions.find((t) => t.id === sheet.editingId);
    if (e) {
      return {
        type: e.type,
        categoryId: e.categoryId ?? 'food',
        accountId: e.accountId,
        toAccountId: e.toAccountId ?? accts[1]?.id ?? accts[0]?.id ?? '',
        date: e.date,
      };
    }
  }
  return {
    type: sheet.presetType ?? 'expense',
    categoryId: 'food',
    accountId: accts[0]?.id ?? '',
    toAccountId: accts[1]?.id ?? accts[0]?.id ?? '',
    date: format(new Date(), 'yyyy-MM-dd'),
  };
}

function initialExprOf(sheet: AddSheetState): string {
  if (!sheet.editingId) return '';
  const e = useStore.getState().transactions.find((t) => t.id === sheet.editingId);
  return e ? String(e.amount) : '';
}

/**
 * 金额键盘区：表达式状态完全内聚在本组件。
 * 输入数字 / 删除 / 加减时父组件零重渲染，仅本区域的金额显示与键盘更新，
 * 这是「连续快速输入全程 60fps」的关键。
 */
const AmountPad = memo(function AmountPad({
  left,
  initialExpr,
  resetKey,
  onSave,
}: {
  left: string;
  initialExpr: string;
  /** 每次打开变化的对象引用，用于重置表达式 */
  resetKey: unknown;
  onSave: (amount: number) => void;
}) {
  const [expr, setExpr] = useState(initialExpr);
  const currency = useStore((s) => s.settings.currency);

  // 打开 / 切换编辑对象时重置表达式
  useEffect(() => {
    setExpr(initialExpr);
  }, [resetKey, initialExpr]);

  const amount = evalExpr(expr);
  const canSave = amount > 0 && amount <= 99999999;

  return (
    <div className="border-t-[0.5px] border-ios-separator dark:border-white/10">
      <div className="flex items-baseline justify-between px-4 pt-2">
        <span className="text-[13px] text-ios-secondary">{left}</span>
        <div className="text-right">
          <span className="text-[26px] font-semibold tracking-tight text-ios-label dark:text-white">
            {formatExpression(expr) || '0'}
          </span>
          {(expr.includes('+') || expr.includes('-')) && (
            <span className="ml-2 text-[14px] text-ios-secondary">
              = {formatMoney(amount, currency)}
            </span>
          )}
        </div>
      </div>
      <Numpad expr={expr} onChange={setExpr} onSave={() => onSave(amount)} saveDisabled={!canSave} />
    </div>
  );
});

/**
 * 「记一笔」底部面板：支出 / 收入 / 转账三种模式。
 *
 * 性能设计：
 * - 面板 keepMounted 常驻（首次打开或空闲后预热），开关只做 CSS 过渡动画；
 * - 表单在渲染期一次性派生（addSheet 变化时单次 commit），打开时主线程立刻空闲；
 * - 金额输入状态内聚在 AmountPad，备注 / 标签为非受控输入——输入全程零父级重渲染。
 */
export function AddTransactionSheet() {
  const addSheet = useUIStore((s) => s.addSheet);
  const closeAdd = useUIStore((s) => s.closeAdd);
  const showToast = useUIStore((s) => s.showToast);
  const accounts = useStore((s) => s.accounts);
  const categories = useStore((s) => s.categories);
  const editing = useStore((s) =>
    addSheet.editingId ? s.transactions.find((t) => t.id === addSheet.editingId) : undefined,
  );

  const open = addSheet.open;

  /**
   * 预热：首次打开或页面空闲 1.8s 后常驻挂载。
   * 之后每次打开 / 关闭只播放动画，不再重新挂载整棵面板树。
   */
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    if (open) {
      setWarm(true);
      return;
    }
    const t = window.setTimeout(() => setWarm(true), 1800);
    return () => window.clearTimeout(t);
  }, [open]);

  // 渲染期派生：addSheet 变化（打开 / 关闭 / 切换编辑对象）时同步重置表单，
  // 整个打开流程只产生一次 commit，动画开始前主线程即已空闲
  const [lastSheet, setLastSheet] = useState(addSheet);
  const [form, setForm] = useState<FormState>(() => makeForm(addSheet));
  if (addSheet !== lastSheet) {
    setLastSheet(addSheet);
    setForm(makeForm(addSheet));
  }

  // 备注 / 标签为非受控输入（打字零重渲染），打开时按编辑对象同步值
  const noteRef = useRef<HTMLInputElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const st = useStore.getState();
    const e = addSheet.editingId
      ? st.transactions.find((t) => t.id === addSheet.editingId)
      : undefined;
    if (noteRef.current) noteRef.current.value = e?.note ?? '';
    if (tagsRef.current) tagsRef.current.value = e ? e.tags.join('，') : '';
  }, [addSheet]);

  const [picking, setPicking] = useState<null | 'from' | 'to'>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const accName = (id: string) => accounts.find((a) => a.id === id)?.name ?? '请选择';
  const categoryName =
    form.type === 'transfer'
      ? '转账'
      : (categories.find((c) => c.id === form.categoryId)?.name ?? '');

  // 切换类型时，把分类重置为该类型下的第一个分类，避免残留无效 categoryId
  const switchType = (v: TxType) => {
    setForm((f) => ({
      ...f,
      type: v,
      categoryId:
        v === 'transfer'
          ? f.categoryId
          : (useStore.getState().categories.find((c) => c.type === v)?.id ?? 'food'),
    }));
  };

  const handleSave = (rawAmount: number) => {
    const amount = Math.round(rawAmount * 100) / 100;
    if (!(amount > 0) || amount > 99999999) {
      showToast('请输入有效金额', { type: 'warn' });
      return;
    }
    if (form.type === 'transfer' && form.accountId === form.toAccountId) {
      showToast('转出与转入不能是同一账户', { type: 'warn' });
      return;
    }
    const tags = (tagsRef.current?.value ?? '')
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const base = {
      type: form.type,
      amount,
      categoryId: form.type === 'transfer' ? null : form.categoryId,
      accountId: form.accountId,
      toAccountId: form.type === 'transfer' ? form.toAccountId : null,
      date: form.date,
      note: (noteRef.current?.value ?? '').trim(),
      tags,
    };

    const s = useStore.getState();
    try {
      if ('vibrate' in navigator) navigator.vibrate(12);
    } catch {
      /* 忽略 */
    }
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

  return (
    <>
      <Sheet open={open} onClose={closeAdd} keepMounted={warm} className="flex max-h-[92vh] flex-col">
        {/* 头部：类型切换 + 关闭 */}
        <div className="flex items-center gap-3 px-4 pb-1">
          <SegmentedControl
            options={TYPE_OPTIONS}
            value={form.type}
            onChange={switchType}
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

        <div className="scroll-contain min-h-0 flex-1 overflow-y-auto px-4 pb-2">
          {form.type === 'transfer' ? (
            <div className="mt-2 overflow-hidden rounded-card bg-ios-bg dark:bg-ios-darkcard2">
              <button
                className="flex w-full items-center justify-between border-b-[0.5px] border-ios-separator px-4 py-3 dark:border-white/10"
                onClick={() => setPicking('from')}
              >
                <span className="text-[16px] text-ios-label dark:text-white">转出账户</span>
                <span className="flex items-center text-[16px] text-ios-secondary">
                  {accName(form.accountId)}
                  <ChevronRight className="ml-1 h-4 w-4 opacity-40" />
                </span>
              </button>
              <button
                className="flex w-full items-center justify-between px-4 py-3"
                onClick={() => setPicking('to')}
              >
                <span className="text-[16px] text-ios-label dark:text-white">转入账户</span>
                <span className="flex items-center text-[16px] text-ios-secondary">
                  {accName(form.toAccountId)}
                  <ChevronRight className="ml-1 h-4 w-4 opacity-40" />
                </span>
              </button>
            </div>
          ) : (
            <CategoryGrid type={form.type} value={form.categoryId} onChange={(id) => setForm((f) => ({ ...f, categoryId: id }))} />
          )}

          {/* 明细信息：日期 / 备注 / 标签 */}
          <div className="mt-3 overflow-hidden rounded-card bg-ios-bg dark:bg-ios-darkcard2">
            <div className="flex items-center border-b-[0.5px] border-ios-separator px-4 py-2.5 dark:border-white/10">
              <Calendar className="h-[18px] w-[18px] text-ios-secondary" />
              <span className="ml-3 text-[16px] text-ios-label dark:text-white">日期</span>
              <label className="relative ml-auto flex min-h-[32px] items-center text-[16px] text-ios-secondary">
                {form.date}
                {/* 透明覆盖的原生日期控件 */}
                <input
                  type="date"
                  value={form.date}
                  max="2100-12-31"
                  onChange={(e) =>
                    e.target.value && setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="absolute inset-0 h-full w-full opacity-0"
                />
              </label>
            </div>
            <div className="flex items-center border-b-[0.5px] border-ios-separator px-4 py-2.5 dark:border-white/10">
              <input
                ref={noteRef}
                placeholder="点击填写备注"
                maxLength={50}
                className="min-h-[32px] w-full bg-transparent text-[16px] text-ios-label outline-none placeholder:text-ios-secondary dark:text-white"
              />
            </div>
            <div className="flex items-center px-4 py-2.5">
              <Tag className="h-[18px] w-[18px] shrink-0 text-ios-secondary" />
              <input
                ref={tagsRef}
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

        {/* 金额展示 + 数字键盘（状态内聚，输入零父级重渲染） */}
        <AmountPad
          left={categoryName}
          initialExpr={initialExprOf(addSheet)}
          resetKey={addSheet}
          onSave={handleSave}
        />
      </Sheet>

      {/* 账户选择（转出 / 转入） */}
      <AccountSelectSheet
        open={picking !== null}
        onClose={() => setPicking(null)}
        selectedId={picking === 'to' ? form.toAccountId : form.accountId}
        disabledId={
          picking === 'to' ? form.accountId : picking === 'from' ? form.toAccountId : null
        }
        onSelect={(id) =>
          picking === 'to'
            ? setForm((f) => ({ ...f, toAccountId: id }))
            : setForm((f) => ({ ...f, accountId: id }))
        }
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
