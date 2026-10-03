import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { startOfMonth } from 'date-fns';
import { ChevronRight, Plus, Wallet } from 'lucide-react';
import { Page } from '../components/layout/Page';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressRing } from '../components/ui/ProgressRing';
import { TransactionList } from '../components/tx/TransactionList';
import { useStore } from '../store/useStore';
import { useUIStore } from '../store/useUIStore';
import { accountBalance, totalBalance } from '../utils/balance';
import { formatMoney } from '../utils/format';
import { budgetColor, budgetStatus } from '../utils/budget';
import { groupByDay, monthStats, sortTxnsDesc } from '../utils/tx';
import { CategoryIcon } from '../constants/icons';

/** 首页：本月收支概览、预算进度、账户总览与最近交易 */
export function HomePage() {
  const navigate = useNavigate();
  const openAdd = useUIStore((s) => s.openAdd);
  const transactions = useStore((s) => s.transactions);
  const accounts = useStore((s) => s.accounts);
  const budget = useStore((s) => s.budget);
  const currency = useStore((s) => s.settings.currency);

  const stats = useMemo(() => monthStats(transactions, startOfMonth(new Date())), [transactions]);
  const recent = useMemo(() => sortTxnsDesc(transactions).slice(0, 5), [transactions]);
  const recentGroups = useMemo(() => groupByDay(recent), [recent]);

  const spent = stats.expense;
  const status = budgetStatus(spent, budget.monthlyTotal);
  const ringColor = status === 'none' ? '#007AFF' : budgetColor(status);
  const ratio = budget.monthlyTotal > 0 ? spent / budget.monthlyTotal : 0;

  return (
    <Page title="轻记账" large tabPadding>
      <div className="space-y-3 px-4">
        {/* 本月收支概览 */}
        <div className="rounded-card bg-white p-4 dark:bg-ios-darkcard">
          <div className="flex items-baseline justify-between">
            <p className="text-[13px] font-medium text-ios-secondary">本月结余</p>
            <p className="text-[13px] text-ios-secondary">{new Date().getFullYear()}年{new Date().getMonth() + 1}月</p>
          </div>
          <p
            className={`mt-0.5 text-[34px] font-bold tracking-tight tabular-nums ${
              stats.balance < 0 ? 'text-ios-red' : 'text-ios-label dark:text-white'
            }`}
          >
            {formatMoney(stats.balance, currency)}
          </p>
          <div className="mt-3 flex">
            <div className="flex-1">
              <p className="text-[12px] text-ios-secondary">本月收入</p>
              <p className="mt-0.5 text-[17px] font-semibold tabular-nums text-ios-green">
                +{formatMoney(stats.income, currency)}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-[12px] text-ios-secondary">本月支出</p>
              <p className="mt-0.5 text-[17px] font-semibold tabular-nums text-ios-label dark:text-white">
                -{formatMoney(stats.expense, currency)}
              </p>
            </div>
          </div>
        </div>

        {/* 预算进度 */}
        <button
          className="flex w-full items-center gap-4 rounded-card bg-white p-4 text-left active:opacity-70 dark:bg-ios-darkcard"
          onClick={() => navigate('/budget')}
        >
          {budget.monthlyTotal > 0 ? (
            <>
              <ProgressRing size={72} stroke={8} progress={ratio} color={ringColor}>
                <span className="text-[15px] font-bold tabular-nums text-ios-label dark:text-white">
                  {Math.round(ratio * 100)}%
                </span>
              </ProgressRing>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-semibold text-ios-label dark:text-white">
                  {status === 'over' ? '本月预算已超支' : '本月预算'}
                </p>
                <p className="mt-0.5 text-[13px] text-ios-secondary">
                  已支出 {formatMoney(spent, currency)} / {formatMoney(budget.monthlyTotal, currency)}
                </p>
                {status !== 'over' && (
                  <p className="mt-0.5 text-[12px] text-ios-green">
                    剩余可用 {formatMoney(budget.monthlyTotal - spent, currency)}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-ios-blue/10">
                <Plus className="h-6 w-6 text-ios-blue" />
              </div>
              <div className="flex-1">
                <p className="text-[16px] font-semibold text-ios-label dark:text-white">
                  设置月度预算
                </p>
                <p className="mt-0.5 text-[13px] text-ios-secondary">
                  掌控每一笔开销，避免超支
                </p>
              </div>
            </>
          )}
          <ChevronRight className="h-4 w-4 shrink-0 text-ios-secondary opacity-50" />
        </button>

        {/* 账户总览 */}
        <div className="rounded-card bg-white p-4 dark:bg-ios-darkcard">
          <div className="flex items-baseline justify-between">
            <p className="text-[13px] font-medium text-ios-secondary">账户总览</p>
            <p className="text-[13px] font-semibold tabular-nums text-ios-label dark:text-white">
              总资产 {formatMoney(totalBalance(transactions, accounts), currency)}
            </p>
          </div>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-0.5">
            {accounts.map((a) => (
              <button
                key={a.id}
                className="flex min-w-[76px] flex-1 flex-col items-center gap-1 rounded-btn bg-ios-bg px-2 py-2.5 active:opacity-60 dark:bg-ios-darkcard2"
                onClick={() => navigate('/accounts')}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: a.color }}
                >
                  <CategoryIcon name={a.icon} className="h-4 w-4 text-white" />
                </span>
                <span className="max-w-full truncate text-[11px] text-ios-secondary">{a.name}</span>
                <span className="max-w-full truncate text-[12px] font-semibold tabular-nums text-ios-label dark:text-white">
                  {formatMoney(accountBalance(transactions, a), currency)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 最近交易 */}
        <div className="pt-1">
          {transactions.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="还没有账目"
              subtitle="点击下方「+」记下第一笔，一切从这里开始"
              action={{ label: '记一笔', onClick: () => openAdd() }}
            />
          ) : (
            <>
              <div className="flex items-baseline justify-between px-1 pb-1 pt-2">
                <p className="text-[20px] font-bold text-ios-label dark:text-white">最近交易</p>
                <button
                  className="flex items-center text-[14px] text-ios-blue active:opacity-60"
                  onClick={() => navigate('/transactions')}
                >
                  全部 <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <TransactionList
                groups={recentGroups}
                onEdit={(tx) => openAdd({ editingId: tx.id })}
                onDelete={(tx) => useStore.getState().deleteTransaction(tx.id)}
              />
            </>
          )}
        </div>
      </div>
    </Page>
  );
}
