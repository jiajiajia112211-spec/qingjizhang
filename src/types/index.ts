/** 全局数据模型定义 */

export type TxType = 'expense' | 'income' | 'transfer';
export type ThemeMode = 'light' | 'dark' | 'system';

/** 分类（预置在常量中，存入 store 以便未来扩展自定义分类） */
export interface Category {
  id: string;
  name: string;
  /** 该分类服务于支出还是收入 */
  type: 'expense' | 'income';
  /** iOS 系统色，如 #FF9500 */
  color: string;
  /** lucide 图标 key，见 constants/icons.tsx */
  icon: string;
}

/** 账户：余额不落库，由 initialBalance 与交易流水实时推导，避免数据不同步 */
export interface Account {
  id: string;
  name: string;
  icon: string;
  color: string;
  initialBalance: number;
}

export interface Transaction {
  id: string;
  type: TxType;
  /** 正数金额；方向由 type 决定 */
  amount: number;
  /** 支出 / 收入的分类；转账为 null */
  categoryId: string | null;
  /** 支出 / 收入的账户；转账为转出账户 */
  accountId: string;
  /** 转账的转入账户，其余类型为 null */
  toAccountId: string | null;
  /** yyyy-MM-dd */
  date: string;
  note: string;
  tags: string[];
  /** 创建时间戳，用于同日排序 */
  createdAt: number;
}

export interface Budget {
  /** 月度总预算，0 表示未设置 */
  monthlyTotal: number;
  /** 分类预算：categoryId -> 月度金额 */
  categoryBudgets: Record<string, number>;
}

export interface Settings {
  theme: ThemeMode;
  /** 货币符号，如 ¥、$ */
  currency: string;
}

/** 导出 / 导入的完整备份结构 */
export interface AppBackup {
  app: 'qing-ledger';
  version: number;
  exportedAt: string;
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budget: Budget;
  settings: Settings;
}

/** 用于「撤销删除」的单条记录 */
export interface DeletedItem {
  tx: Transaction;
  index: number;
}

/** 明细页筛选条件 */
export interface TxFilter {
  keyword: string;
  type: 'all' | TxType;
  categoryIds: string[];
  accountIds: string[];
  minAmount: number | null;
  maxAmount: number | null;
  from: string | null;
  to: string | null;
}
