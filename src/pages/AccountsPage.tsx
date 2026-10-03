import { useState } from 'react';
import { ArrowLeftRight, Plus, Trash2 } from 'lucide-react';
import { Page } from '../components/layout/Page';
import { Sheet } from '../components/ui/Sheet';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { CategoryIcon } from '../constants/icons';
import { useStore } from '../store/useStore';
import { useUIStore } from '../store/useUIStore';
import { accountBalance, totalBalance } from '../utils/balance';
import { formatMoney } from '../utils/format';
import { ACCOUNT_PRESETS } from '../constants/categories';
import type { Account } from '../types';

/** 账户页：总资产、账户列表（点击编辑）、新增账户、发起转账 */
export function AccountsPage() {
  const accounts = useStore((s) => s.accounts);
  const transactions = useStore((s) => s.transactions);
  const currency = useStore((s) => s.settings.currency);
  const openAdd = useUIStore((s) => s.openAdd);

  const [editing, setEditing] = useState<Account | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <Page
      title="账户"
      large
      back
      right={
        <button
          className="flex h-9 w-9 items-center justify-center text-ios-blue active:opacity-50"
          onClick={() => setCreating(true)}
          aria-label="新增账户"
        >
          <Plus className="h-5 w-5" />
        </button>
      }
    >
      <div className="space-y-3 px-4">
        {/* 总资产 */}
        <div className="rounded-card bg-white p-4 text-center dark:bg-ios-darkcard">
          <p className="text-[13px] text-ios-secondary">净资产（所有账户余额合计）</p>
          <p className="mt-1 text-[32px] font-bold tracking-tight tabular-nums text-ios-label dark:text-white">
            {formatMoney(totalBalance(transactions, accounts), currency)}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-btn bg-ios-blue text-[15px] font-semibold text-white active:opacity-80"
            onClick={() => openAdd({ presetType: 'transfer' })}
          >
            <ArrowLeftRight className="h-4 w-4" /> 转账
          </button>
          <button
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-btn bg-black/[0.06] text-[15px] font-semibold text-ios-label active:opacity-60 dark:bg-white/[0.1] dark:text-white"
            onClick={() => setCreating(true)}
          >
            <Plus className="h-4 w-4" /> 新增账户
          </button>
        </div>

        {/* 账户列表 */}
        {accounts.length === 0 ? (
          <div className="rounded-card bg-white dark:bg-ios-darkcard">
            <EmptyState
              icon={Plus}
              title="还没有账户"
              subtitle="添加现金、银行卡等账户开始记账"
              action={{ label: '新增账户', onClick: () => setCreating(true) }}
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-card bg-white dark:bg-ios-darkcard">
            {accounts.map((a) => (
              <button
                key={a.id}
                className="flex w-full items-center gap-3 border-b-[0.5px] border-ios-separator px-4 py-3 text-left last:border-0 active:bg-black/[0.03] dark:border-white/[0.12] dark:active:bg-white/[0.04]"
                onClick={() => setEditing(a)}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: a.color }}
                >
                  <CategoryIcon name={a.icon} className="h-5 w-5 text-white" />
                </span>
                <span className="flex-1 text-[16px] font-medium text-ios-label dark:text-white">
                  {a.name}
                </span>
                <span
                  className={`text-[16px] font-semibold tabular-nums ${
                    accountBalance(transactions, a) < 0
                      ? 'text-ios-red'
                      : 'text-ios-label dark:text-white'
                  }`}
                >
                  {formatMoney(accountBalance(transactions, a), currency)}
                </span>
              </button>
            ))}
          </div>
        )}

        <p className="px-2 text-[12px] leading-5 text-ios-secondary dark:text-[#98989F]">
          账户余额由初始余额与全部交易流水实时计算，点击账户可修改名称与初始余额。
        </p>
      </div>

      {/* 新增 / 编辑账户弹窗 */}
      <AccountFormSheet
        open={creating || editing !== null}
        account={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
    </Page>
  );
}

/** 新增 / 编辑账户表单弹窗 */
function AccountFormSheet({
  open,
  account,
  onClose,
}: {
  open: boolean;
  account: Account | null;
  onClose: () => void;
}) {
  const transactions = useStore((s) => s.transactions);
  const [name, setName] = useState('');
  const [presetIdx, setPresetIdx] = useState(0);
  const [initial, setInitial] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const showToast = useUIStore((s) => s.showToast);

  // 打开时按账户初始化
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setName(account?.name ?? '');
    setPresetIdx(
      Math.max(
        ACCOUNT_PRESETS.findIndex((p) => p.icon === (account?.icon ?? 'cash')),
        0,
      ),
    );
    setInitial(account && account.initialBalance !== 0 ? String(account.initialBalance) : '');
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const preset = ACCOUNT_PRESETS[presetIdx];

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('请输入账户名称', { type: 'warn' });
      return;
    }
    const init = initial.trim() === '' ? 0 : Number(initial);
    if (Number.isNaN(init) || Math.abs(init) > 99999999) {
      showToast('初始余额格式不正确', { type: 'warn' });
      return;
    }
    const s = useStore.getState();
    if (account) {
      s.updateAccount(account.id, {
        name: trimmed,
        icon: preset.icon,
        color: preset.color,
        initialBalance: init,
      });
      showToast('账户已更新');
    } else {
      s.addAccount({
        name: trimmed,
        icon: preset.icon,
        color: preset.color,
        initialBalance: init,
      });
      showToast('账户已创建');
    }
    onClose();
  };

  const relatedCount = account
    ? transactions.filter(
        (t) => t.accountId === account.id || t.toAccountId === account.id,
      ).length
    : 0;

  return (
    <>
      <Sheet open={open} onClose={onClose}>
        <div className="pb-safe">
          <h3 className="pb-3 text-center text-[17px] font-semibold text-ios-label dark:text-white">
            {account ? '编辑账户' : '新增账户'}
          </h3>

          <div className="space-y-3 px-4">
            {/* 图标选择 */}
            <div className="flex justify-center gap-4 rounded-card bg-ios-bg p-3 dark:bg-ios-darkcard2">
              {ACCOUNT_PRESETS.map((p, i) => (
                <button
                  key={p.icon}
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                    i === presetIdx
                      ? 'ring-2 ring-ios-blue ring-offset-2 ring-offset-white dark:ring-offset-ios-darkcard'
                      : 'opacity-70'
                  }`}
                  style={{ backgroundColor: p.color }}
                  onClick={() => setPresetIdx(i)}
                >
                  <CategoryIcon name={p.icon} className="h-5 w-5 text-white" />
                </button>
              ))}
            </div>

            {/* 名称 */}
            <div className="flex items-center gap-3 rounded-card bg-ios-bg px-4 dark:bg-ios-darkcard2">
              <span className="text-[15px] text-ios-secondary">名称</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如：招行储蓄卡"
                maxLength={12}
                className="min-h-[48px] w-full bg-transparent text-right text-[16px] text-ios-label outline-none placeholder:text-ios-secondary dark:text-white"
              />
            </div>

            {/* 初始余额 */}
            <div className="flex items-center gap-3 rounded-card bg-ios-bg px-4 dark:bg-ios-darkcard2">
              <span className="text-[15px] text-ios-secondary">初始余额</span>
              <input
                type="number"
                inputMode="decimal"
                value={initial}
                onChange={(e) => setInitial(e.target.value)}
                placeholder="0.00"
                className="min-h-[48px] w-full bg-transparent text-right text-[16px] tabular-nums text-ios-label outline-none placeholder:text-ios-secondary dark:text-white"
              />
            </div>

            {account && (
              <button
                className="flex h-11 w-full items-center justify-center gap-1.5 rounded-btn bg-ios-red/10 text-[15px] font-semibold text-ios-red active:opacity-60"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4" /> 删除该账户
              </button>
            )}
          </div>

          <div className="flex gap-3 p-4 pt-4">
            <button
              className="h-11 flex-1 rounded-btn bg-black/[0.06] text-[16px] font-semibold text-ios-label active:opacity-60 dark:bg-white/[0.1] dark:text-white"
              onClick={onClose}
            >
              取消
            </button>
            <button
              className="h-11 flex-[2] rounded-btn bg-ios-blue text-[16px] font-semibold text-white active:opacity-80"
              onClick={save}
            >
              {account ? '保存' : '创建'}
            </button>
          </div>
        </div>
      </Sheet>

      <ConfirmDialog
        open={confirmDelete}
        title={`删除「${account?.name ?? ''}」？`}
        message={
          relatedCount > 0
            ? `该账户下的 ${relatedCount} 笔交易将一并删除，且无法撤销。`
            : '删除后无法撤销。'
        }
        confirmText="删除"
        destructive
        onConfirm={() => {
          if (account) useStore.getState().deleteAccount(account.id);
          showToast('账户已删除');
          onClose();
        }}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
