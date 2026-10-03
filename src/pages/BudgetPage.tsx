import { useMemo, useState } from 'react';
import { getDaysInMonth, startOfMonth } from 'date-fns';
import { Plus, Target } from 'lucide-react';
import { Page } from '../components/layout/Page';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressRing } from '../components/ui/ProgressRing';
import { ProgressBar } from '../components/ui/ProgressBar';
import { AmountSheet } from '../components/tx/AmountSheet';
import { useStore } from '../store/useStore';
import { budgetColor, budgetStatus, categorySpend, totalSpend } from '../utils/budget';
import { formatMoney } from '../utils/format';
import { CategoryIcon } from '../constants/icons';

/** 预算页：总预算环形进度 + 分类预算列表（点击编辑，超支红色预警） */
export function BudgetPage() {
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const budget = useStore((s) => s.budget);
  const currency = useStore((s) => s.settings.currency);

  const month = startOfMonth(new Date());
  const spent = useMemo(() => totalSpend(transactions, month), [transactions, month]);

  const [totalSheetOpen, setTotalSheetOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<{ id: string; name: string } | null>(null);
  const [addingCat, setAddingCat] = useState(false);

  const status = budgetStatus(spent, budget.monthlyTotal);
  const ratio = budget.monthlyTotal > 0 ? spent / budget.monthlyTotal : 0;
  // 月末倒计时与日均可用
  const today = new Date().getDate();
  const daysLeft = Math.max(getDaysInMonth(month) - today + 1, 1);
  const dailyAvailable = budget.monthlyTotal > 0 ? (budget.monthlyTotal - spent) / daysLeft : 0;

  // 已设预算的分类 + 各自的支出进度
  const catBudgets = Object.entries(budget.categoryBudgets)
    .map(([id, limit]) => ({
      id,
      limit,
      name: categories.find((c) => c.id === id)?.name ?? '未知分类',
      icon: categories.find((c) => c.id === id)?.icon ?? 'other',
      color: categories.find((c) => c.id === id)?.color ?? '#8E8E93',
      spent: categorySpend(transactions, id, month),
    }))
    .sort((a, b) => b.spent / b.limit - a.spent / a.limit);

  // 还没设预算的支出分类（用于「添加」）
  const unBudgeted = categories.filter(
    (c) => c.type === 'expense' && !(c.id in budget.categoryBudgets),
  );

  return (
    <Page title="预算" large back>
      <div className="space-y-3 px-4">
        {/* 总预算 */}
        <div className="flex flex-col items-center rounded-card bg-white p-5 dark:bg-ios-darkcard">
          {budget.monthlyTotal > 0 ? (
            <>
              <ProgressRing size={132} stroke={12} progress={ratio} color={budgetColor(status)}>
                <span className="text-[11px] text-ios-secondary">本月已用</span>
                <span className="text-[26px] font-bold tabular-nums leading-tight text-ios-label dark:text-white">
                  {Math.round(ratio * 100)}%
                </span>
              </ProgressRing>
              <p className="mt-3 text-[15px] font-medium text-ios-label dark:text-white">
                {formatMoney(spent, currency)} / {formatMoney(budget.monthlyTotal, currency)}
              </p>
              <p
                className={`mt-1 text-[13px] ${
                  status === 'over' ? 'text-ios-red' : 'text-ios-secondary'
                }`}
              >
                {status === 'over'
                  ? `已超支 ${formatMoney(spent - budget.monthlyTotal, currency)}，注意控制开销`
                  : `剩余 ${formatMoney(budget.monthlyTotal - spent, currency)} · 日均可用 ${formatMoney(
                      Math.max(dailyAvailable, 0),
                      currency,
                    )}`}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center py-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ios-blue/10">
                <Target className="h-8 w-8 text-ios-blue" strokeWidth={1.6} />
              </div>
              <p className="mt-3 text-[16px] font-semibold text-ios-label dark:text-white">
                还没有设置总预算
              </p>
              <p className="mt-1 text-[13px] text-ios-secondary">设置每月支出上限，掌握花钱节奏</p>
            </div>
          )}
          <button
            className="mt-4 h-10 w-full rounded-btn bg-ios-bg text-[15px] font-semibold text-ios-blue active:opacity-60 dark:bg-ios-darkcard2"
            onClick={() => setTotalSheetOpen(true)}
          >
            {budget.monthlyTotal > 0 ? '调整总预算' : '设置总预算'}
          </button>
        </div>

        {/* 分类预算 */}
        <div>
          <div className="flex items-baseline justify-between px-1 pb-1.5 pt-1">
            <p className="text-[20px] font-bold text-ios-label dark:text-white">分类预算</p>
            <span className="text-[12px] text-ios-secondary">点击可修改</span>
          </div>

          {catBudgets.length === 0 && unBudgeted.length > 0 && (
            <div className="rounded-card bg-white dark:bg-ios-darkcard">
              <EmptyState
                icon={Target}
                title="还没有分类预算"
                subtitle="为餐饮、购物等常用分类单独设限"
              />
            </div>
          )}

          {catBudgets.length > 0 && (
            <div className="overflow-hidden rounded-card bg-white dark:bg-ios-darkcard">
              {catBudgets.map((cb) => {
                const st = budgetStatus(cb.spent, cb.limit);
                const r = cb.limit > 0 ? cb.spent / cb.limit : 0;
                return (
                  <button
                    key={cb.id}
                    className="flex w-full items-center gap-3 border-b-[0.5px] border-ios-separator px-4 py-3 text-left last:border-0 active:bg-black/[0.03] dark:border-white/[0.12] dark:active:bg-white/[0.04]"
                    onClick={() => setEditingCat({ id: cb.id, name: cb.name })}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: cb.color }}
                    >
                      <CategoryIcon name={cb.icon} className="h-5 w-5 text-white" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[15px] font-medium text-ios-label dark:text-white">
                          {cb.name}
                        </span>
                        <span
                          className={`text-[14px] font-semibold tabular-nums ${
                            st === 'over' ? 'text-ios-red' : 'text-ios-label dark:text-white'
                          }`}
                        >
                          {formatMoney(cb.spent, currency)} / {formatMoney(cb.limit, currency)}
                        </span>
                      </div>
                      <ProgressBar progress={r} color={budgetColor(st)} className="mt-2" />
                      <p
                        className={`mt-1 text-[11px] ${
                          st === 'over'
                            ? 'text-ios-red'
                            : st === 'warn'
                              ? 'text-ios-orange'
                              : 'text-ios-secondary'
                        }`}
                      >
                        {st === 'over'
                          ? `已超支 ${formatMoney(cb.spent - cb.limit, currency)}`
                          : st === 'warn'
                            ? `即将超支，剩余 ${formatMoney(cb.limit - cb.spent, currency)}`
                            : `剩余 ${formatMoney(cb.limit - cb.spent, currency)}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 添加分类预算 */}
          {unBudgeted.length > 0 && (
            <button
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-card border-[1.5px] border-dashed border-ios-separator py-3.5 text-[15px] font-medium text-ios-blue active:opacity-60 dark:border-white/20"
              onClick={() => setAddingCat(true)}
            >
              <Plus className="h-4 w-4" /> 添加分类预算
            </button>
          )}

          {/* 添加分类预算的选择列表 */}
          {addingCat && (
            <div className="mt-3 overflow-hidden rounded-card bg-white dark:bg-ios-darkcard">
              {unBudgeted.map((c) => (
                <button
                  key={c.id}
                  className="flex w-full items-center gap-3 border-b-[0.5px] border-ios-separator px-4 py-3 text-left last:border-0 active:bg-black/[0.03] dark:border-white/[0.12] dark:active:bg-white/[0.04]"
                  onClick={() => {
                    setEditingCat({ id: c.id, name: c.name });
                    setAddingCat(false);
                  }}
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: c.color }}
                  >
                    <CategoryIcon name={c.icon} className="h-4 w-4 text-white" />
                  </span>
                  <span className="text-[15px] text-ios-label dark:text-white">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 总预算编辑 */}
      <AmountSheet
        open={totalSheetOpen}
        title="每月总预算"
        initial={budget.monthlyTotal > 0 ? String(budget.monthlyTotal) : ''}
        onClose={() => setTotalSheetOpen(false)}
        onConfirm={(v) => useStore.getState().setTotalBudget(v)}
      />

      {/* 分类预算编辑（编辑态提供清除） */}
      <AmountSheet
        open={editingCat !== null}
        title={`「${editingCat?.name ?? ''}」每月预算`}
        initial={
          editingCat ? String(budget.categoryBudgets[editingCat.id] ?? '') : ''
        }
        allowClear={editingCat ? (budget.categoryBudgets[editingCat.id] ?? 0) > 0 : false}
        onClose={() => setEditingCat(null)}
        onConfirm={(v) => editingCat && useStore.getState().setCategoryBudget(editingCat.id, v)}
      />
    </Page>
  );
}
