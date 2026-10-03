import { format, startOfMonth, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Account, Category, Transaction, TxFilter, TxType } from '../types';
import { evalExpr } from './format';

/** 按日期倒序（同日按创建时间倒序） */
export function sortTxnsDesc(txns: Transaction[]): Transaction[] {
  return [...txns].sort((a, b) =>
    a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1,
  );
}

export interface DayGroup {
  date: string;
  /** "10月3日 周五" */
  label: string;
  income: number;
  expense: number;
  items: Transaction[];
}

/** 将已筛选的交易按日分组，组头汇总当日收支 */
export function groupByDay(txns: Transaction[]): DayGroup[] {
  const sorted = sortTxnsDesc(txns);
  const groups: DayGroup[] = [];
  const map = new Map<string, DayGroup>();
  for (const t of sorted) {
    let g = map.get(t.date);
    if (!g) {
      const d = new Date(t.date + 'T00:00:00');
      g = {
        date: t.date,
        label: `${format(d, 'M月d日')} ${format(d, 'EEE', { locale: zhCN })}`,
        income: 0,
        expense: 0,
        items: [],
      };
      map.set(t.date, g);
      groups.push(g);
    }
    g.items.push(t);
    if (t.type === 'expense') g.expense += t.amount;
    if (t.type === 'income') g.income += t.amount;
  }
  return groups;
}

export interface MonthStats {
  income: number;
  expense: number;
  balance: number;
}

/** 某月收支统计（转账不计入收支） */
export function monthStats(txns: Transaction[], month: Date): MonthStats {
  const prefix = format(month, 'yyyy-MM');
  let income = 0;
  let expense = 0;
  for (const t of txns) {
    if (!t.date.startsWith(prefix)) continue;
    if (t.type === 'income') income += t.amount;
    else if (t.type === 'expense') expense += t.amount;
  }
  return { income, expense, balance: income - expense };
}

export interface CategoryTotal {
  categoryId: string;
  total: number;
}

/** 某月按分类汇总（默认支出），降序 */
export function categoryTotals(
  txns: Transaction[],
  month: Date,
  type: 'expense' | 'income' = 'expense',
): CategoryTotal[] {
  const prefix = format(month, 'yyyy-MM');
  const map = new Map<string, number>();
  for (const t of txns) {
    if (t.type !== type || !t.date.startsWith(prefix) || !t.categoryId) continue;
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
  }
  return [...map.entries()]
    .map(([categoryId, total]) => ({ categoryId, total }))
    .sort((a, b) => b.total - a.total);
}

/** 最近 N 个月（含 month，向前推）趋势数据 */
export function monthsTrend(
  txns: Transaction[],
  month: Date,
  n = 6,
): Array<{ label: string; income: number; expense: number }> {
  const out: Array<{ label: string; income: number; expense: number }> = [];
  for (let i = n - 1; i >= 0; i--) {
    const m = subMonths(month, i);
    const s = monthStats(txns, m);
    out.push({ label: format(m, 'M月'), income: s.income, expense: s.expense });
  }
  return out;
}

export const EMPTY_FILTER: TxFilter = {
  keyword: '',
  type: 'all',
  categoryIds: [],
  accountIds: [],
  minAmount: null,
  maxAmount: null,
  from: null,
  to: null,
};

/** 统计已启用的筛选条件数量（用于筛选按钮角标） */
export function countActiveFilters(f: TxFilter): number {
  let n = 0;
  if (f.type !== 'all') n++;
  n += f.categoryIds.length > 0 ? 1 : 0;
  n += f.accountIds.length > 0 ? 1 : 0;
  if (f.minAmount !== null) n++;
  if (f.maxAmount !== null) n++;
  if (f.from) n++;
  if (f.to) n++;
  return n;
}

/** 应用筛选条件（关键词匹配备注 / 标签 / 分类名 / 账户名） */
export function filterTransactions(
  txns: Transaction[],
  f: TxFilter,
  categories: Category[],
  accounts: Account[],
): Transaction[] {
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const accName = new Map(accounts.map((a) => [a.id, a.name]));
  const kw = f.keyword.trim().toLowerCase();

  return txns.filter((t) => {
    if (f.type !== 'all' && t.type !== f.type) return false;
    if (f.categoryIds.length > 0 && (!t.categoryId || !f.categoryIds.includes(t.categoryId)))
      return false;
    if (f.accountIds.length > 0) {
      const involved =
        f.accountIds.includes(t.accountId) ||
        (t.toAccountId !== null && f.accountIds.includes(t.toAccountId));
      if (!involved) return false;
    }
    if (f.minAmount !== null && t.amount < f.minAmount) return false;
    if (f.maxAmount !== null && t.amount > f.maxAmount) return false;
    if (f.from && t.date < f.from) return false;
    if (f.to && t.date > f.to) return false;
    if (kw) {
      const hay = [
        t.note,
        ...t.tags,
        t.categoryId ? (catName.get(t.categoryId) ?? '') : '',
        accName.get(t.accountId) ?? '',
        t.toAccountId ? (accName.get(t.toAccountId) ?? '') : '',
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    return true;
  });
}

/** 金额输入容错解析：支持 "12+3" 这类表达式与空值 */
export function parseAmountInput(s: string): number {
  if (!s.trim()) return 0;
  return Math.abs(evalExpr(s.replace(/[^0-9.+-]/g, '')));
}
