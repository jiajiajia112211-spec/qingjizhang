import { format } from 'date-fns';
import type { AppBackup, Account, Category, Settings, Transaction, Budget } from '../types';
import { DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES } from '../constants/categories';

/** 触发浏览器下载 */
function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** 导出完整备份 JSON */
export function exportJSON(data: Omit<AppBackup, 'app' | 'version' | 'exportedAt'>): void {
  const backup: AppBackup = {
    app: 'qing-ledger',
    version: 1,
    exportedAt: new Date().toISOString(),
    ...data,
  };
  download(
    `轻记账备份-${format(new Date(), 'yyyy-MM-dd')}.json`,
    JSON.stringify(backup, null, 2),
    'application/json',
  );
}

const CSV_HEADER = '日期,类型,分类,账户,转入账户,金额,备注,标签';
const TX_TYPE_LABEL: Record<Transaction['type'], string> = {
  expense: '支出',
  income: '收入',
  transfer: '转账',
};

function csvCell(v: string | number): string {
  const s = String(v);
  // 含逗号 / 引号 / 换行时用引号包裹
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** 导出 CSV（带 BOM，Excel 打开中文不乱码） */
export function exportCSV(
  txns: Transaction[],
  categories: Category[],
  accounts: Account[],
): void {
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const accName = new Map(accounts.map((a) => [a.id, a.name]));
  const lines = txns.map((t) =>
    [
      t.date,
      TX_TYPE_LABEL[t.type],
      t.categoryId ? (catName.get(t.categoryId) ?? '') : '',
      accName.get(t.accountId) ?? '',
      t.toAccountId ? (accName.get(t.toAccountId) ?? '') : '',
      t.amount,
      t.note,
      t.tags.join(' '),
    ]
      .map(csvCell)
      .join(','),
  );
  download(
    `轻记账明细-${format(new Date(), 'yyyy-MM-dd')}.csv`,
    '\uFEFF' + [CSV_HEADER, ...lines].join('\n'),
    'text/csv;charset=utf-8',
  );
}

/** 解析并校验备份 JSON，结构不合法时抛出中文错误 */
export function parseBackup(text: string): AppBackup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('文件不是合法的 JSON');
  }
  const b = raw as Partial<AppBackup>;
  if (!b || b.app !== 'qing-ledger' || !Array.isArray(b.transactions)) {
    throw new Error('不是轻记账的备份文件');
  }
  return {
    app: 'qing-ledger',
    version: b.version ?? 1,
    exportedAt: b.exportedAt ?? '',
    transactions: b.transactions,
    accounts: Array.isArray(b.accounts) ? b.accounts : [],
    categories: Array.isArray(b.categories) ? b.categories : DEFAULT_CATEGORIES,
    budget: (b.budget ?? { monthlyTotal: 0, categoryBudgets: {} }) as Budget,
    settings: (b.settings ?? { theme: 'system', currency: '¥' }) as Settings,
  };
}
