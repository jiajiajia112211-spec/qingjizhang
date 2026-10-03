import { format } from 'date-fns';
import type { Budget, Category, Transaction } from '../types';

/** 某月某分类的支出总额 */
export function categorySpend(
  txns: Transaction[],
  categoryId: string,
  month: Date,
): number {
  const prefix = format(month, 'yyyy-MM');
  let sum = 0;
  for (const t of txns) {
    if (t.type === 'expense' && t.categoryId === categoryId && t.date.startsWith(prefix)) {
      sum += t.amount;
    }
  }
  return sum;
}

/** 某月总支出 */
export function totalSpend(txns: Transaction[], month: Date): number {
  const prefix = format(month, 'yyyy-MM');
  let sum = 0;
  for (const t of txns) {
    if (t.type === 'expense' && t.date.startsWith(prefix)) sum += t.amount;
  }
  return sum;
}

export type BudgetStatus = 'none' | 'safe' | 'warn' | 'over';

/** 已用比例对应的状态：>=100% 超支，>=80% 预警 */
export function budgetStatus(spent: number, limit: number): BudgetStatus {
  if (limit <= 0) return 'none';
  const ratio = spent / limit;
  if (ratio >= 1) return 'over';
  if (ratio >= 0.8) return 'warn';
  return 'safe';
}

/** 状态对应的进度条颜色 */
export function budgetColor(status: BudgetStatus): string {
  if (status === 'over') return '#FF3B30';
  if (status === 'warn') return '#FF9500';
  return '#34C759';
}

/**
 * 记账后的超支提醒文案：优先提示分类超支，其次总预算。
 * 在交易已保存（流水已包含该笔）后调用。
 */
export function budgetWarning(
  txns: Transaction[],
  budget: Budget,
  tx: Pick<Transaction, 'type' | 'categoryId' | 'date'>,
  categories: Category[],
): string | null {
  if (tx.type !== 'expense' || !tx.categoryId) return null;
  const month = new Date(tx.date + 'T00:00:00');

  const catLimit = budget.categoryBudgets[tx.categoryId] ?? 0;
  if (catLimit > 0) {
    const spent = categorySpend(txns, tx.categoryId, month);
    if (spent > catLimit) {
      const cat = categories.find((c) => c.id === tx.categoryId);
      return `本月「${cat?.name ?? '分类'}」预算已超支`;
    }
  }
  if (budget.monthlyTotal > 0 && totalSpend(txns, month) > budget.monthlyTotal) {
    return '本月总预算已超支';
  }
  return null;
}
