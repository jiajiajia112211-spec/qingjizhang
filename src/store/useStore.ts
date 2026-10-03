import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  Account,
  AppBackup,
  Budget,
  Category,
  DeletedItem,
  Settings,
  Transaction,
} from '../types';
import { uid } from '../utils/id';
import { DEFAULT_CATEGORIES } from '../constants/categories';

interface AppState {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budget: Budget;
  settings: Settings;

  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => string;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  /** 删除并返回其位置索引，用于撤销恢复 */
  deleteTransaction: (id: string) => DeletedItem | null;
  deleteTransactions: (ids: string[]) => DeletedItem[];
  /** 撤销删除：按原位置插回 */
  restoreTransactions: (items: DeletedItem[]) => void;

  addAccount: (a: Omit<Account, 'id'>) => string;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  /** 删除账户会级联删除其相关交易（转出的对方转入记录同样删除） */
  deleteAccount: (id: string) => void;

  setTotalBudget: (n: number) => void;
  setCategoryBudget: (categoryId: string, n: number) => void;

  updateSettings: (patch: Partial<Settings>) => void;
  /** 导入备份：整体覆盖 */
  importData: (backup: AppBackup) => void;
  /** 清空全部数据并恢复初始状态 */
  resetAll: () => void;
}

const INITIAL_ACCOUNTS: Account[] = [
  { id: 'cash', name: '现金', icon: 'cash', color: '#34C759', initialBalance: 0 },
  { id: 'bank', name: '银行卡', icon: 'bank', color: '#5856D6', initialBalance: 0 },
  { id: 'alipay', name: '支付宝', icon: 'alipay', color: '#1677FF', initialBalance: 0 },
  { id: 'wechat', name: '微信', icon: 'wechat', color: '#07C160', initialBalance: 0 },
  { id: 'credit', name: '信用卡', icon: 'credit', color: '#FF9500', initialBalance: 0 },
];

function createInitialState() {
  return {
    transactions: [] as Transaction[],
    accounts: INITIAL_ACCOUNTS,
    categories: DEFAULT_CATEGORIES,
    budget: { monthlyTotal: 0, categoryBudgets: {} } as Budget,
    settings: { theme: 'system', currency: '¥' } as Settings,
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      addTransaction: (tx) => {
        const id = uid();
        const full: Transaction = { ...tx, id, createdAt: Date.now() };
        set((s) => ({ transactions: [full, ...s.transactions] }));
        return id;
      },

      updateTransaction: (id, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      deleteTransaction: (id) => {
        const list = get().transactions;
        const index = list.findIndex((t) => t.id === id);
        if (index === -1) return null;
        set({ transactions: list.filter((t) => t.id !== id) });
        return { tx: list[index], index };
      },

      deleteTransactions: (ids) => {
        const list = get().transactions;
        const removed: DeletedItem[] = [];
        list.forEach((tx, index) => {
          if (ids.includes(tx.id)) removed.push({ tx, index });
        });
        set({ transactions: list.filter((t) => !ids.includes(t.id)) });
        return removed;
      },

      restoreTransactions: (items) =>
        set((s) => {
          const list = [...s.transactions];
          // 按原索引升序依次插回，保持删除前的顺序
          [...items]
            .sort((a, b) => a.index - b.index)
            .forEach(({ tx, index }) => list.splice(Math.min(index, list.length), 0, tx));
          return { transactions: list };
        }),

      addAccount: (a) => {
        const id = uid();
        set((s) => ({ accounts: [...s.accounts, { ...a, id }] }));
        return id;
      },

      updateAccount: (id, patch) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),

      deleteAccount: (id) =>
        set((s) => ({
          accounts: s.accounts.filter((a) => a.id !== id),
          // 级联删除：本账户的收支 + 转账两端任一涉及即删除
          transactions: s.transactions.filter(
            (t) => t.accountId !== id && t.toAccountId !== id,
          ),
        })),

      setTotalBudget: (n) =>
        set((s) => ({ budget: { ...s.budget, monthlyTotal: Math.max(0, n) } })),

      setCategoryBudget: (categoryId, n) =>
        set((s) => {
          const next = { ...s.budget.categoryBudgets };
          if (n > 0) next[categoryId] = n;
          else delete next[categoryId]; // 置 0 表示取消该分类预算
          return { budget: { ...s.budget, categoryBudgets: next } };
        }),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      importData: (backup) =>
        set({
          transactions: backup.transactions,
          accounts: backup.accounts.length > 0 ? backup.accounts : INITIAL_ACCOUNTS,
          categories: backup.categories,
          budget: backup.budget,
          settings: backup.settings,
        }),

      resetAll: () => set({ ...createInitialState() }),
    }),
    {
      name: 'qing-ledger',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
