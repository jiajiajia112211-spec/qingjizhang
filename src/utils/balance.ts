import type { Account, Transaction } from '../types';

/**
 * 账户余额 = 初始余额 ± 流水。
 * 余额实时推导而非落库，保证增删改交易后永不失同步。
 */
export function accountBalance(txns: Transaction[], account: Account): number {
  let balance = account.initialBalance;
  for (const t of txns) {
    if (t.type === 'expense' && t.accountId === account.id) {
      balance -= t.amount;
    } else if (t.type === 'income' && t.accountId === account.id) {
      balance += t.amount;
    } else if (t.type === 'transfer') {
      if (t.accountId === account.id) balance -= t.amount;
      if (t.toAccountId === account.id) balance += t.amount;
    }
  }
  return Math.round(balance * 100) / 100;
}

/** 所有账户余额合计（总资产） */
export function totalBalance(txns: Transaction[], accounts: Account[]): number {
  return Math.round(
    accounts.reduce((sum, a) => sum + accountBalance(txns, a), 0) * 100,
  ) / 100;
}
