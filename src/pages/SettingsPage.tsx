import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Download,
  FileJson,
  FileSpreadsheet,
  Moon,
  Sun,
  Trash2,
  Upload,
  Wallet,
  Target,
  Info,
} from 'lucide-react';
import { Page } from '../components/layout/Page';
import { Sheet } from '../components/ui/Sheet';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { useStore } from '../store/useStore';
import { useUIStore } from '../store/useUIStore';
import { CURRENCIES } from '../constants/categories';
import { exportCSV, exportJSON, parseBackup } from '../utils/backup';
import type { ThemeMode } from '../types';

const APP_VERSION = '1.0.0';

/** 设置页：外观 / 货币 / 数据导入导出 / 危险操作 / 其他入口 */
export function SettingsPage() {
  const navigate = useNavigate();
  const settings = useStore((s) => s.settings);
  const transactions = useStore((s) => s.transactions);
  const accounts = useStore((s) => s.accounts);
  const categories = useStore((s) => s.categories);
  const budget = useStore((s) => s.budget);
  const showToast = useUIStore((s) => s.showToast);

  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 外观三态：浅色 / 深色 / 跟随系统
  const themeMode = settings.theme;
  const setTheme = (mode: ThemeMode) => useStore.getState().updateSettings({ theme: mode });

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const backup = parseBackup(text);
      useStore.getState().importData(backup);
      showToast(`导入成功，共 ${backup.transactions.length} 笔交易`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : '导入失败', { type: 'warn' });
    }
  };

  return (
    <Page title="设置" large tabPadding>
      <div className="space-y-5 px-4">
        {/* 通用 */}
        <Section title="通用">
          {/* 外观 */}
          <div className="flex items-center gap-3 px-4 py-3">
            <RowIcon icon={<Moon className="h-[18px] w-[18px] text-white" />} bg="#5856D6" />
            <span className="shrink-0 text-[16px] text-ios-label dark:text-white">外观</span>
            <SegmentedControl<ThemeMode>
              options={[
                { value: 'light', label: '浅色' },
                { value: 'dark', label: '深色' },
                { value: 'system', label: '跟随系统' },
              ]}
              value={themeMode}
              onChange={setTheme}
              className="ml-auto w-[190px] shrink-0"
            />
          </div>
          <RowDivider />
          <button className="flex w-full items-center gap-3 px-4 py-3 active:bg-black/[0.03] dark:active:bg-white/[0.04]" onClick={() => setCurrencyOpen(true)}>
            <RowIcon icon={<Sun className="h-[18px] w-[18px] text-white" />} bg="#FF9500" />
            <span className="flex-1 text-left text-[16px] text-ios-label dark:text-white">货币单位</span>
            <span className="text-[15px] text-ios-secondary">{settings.currency}</span>
            <ChevronRight className="h-4 w-4 text-ios-secondary opacity-40" />
          </button>
        </Section>

        {/* 数据 */}
        <Section title="数据">
          <button
            className="flex w-full items-center gap-3 px-4 py-3 active:bg-black/[0.03] dark:active:bg-white/[0.04]"
            onClick={() => exportJSON({ transactions, accounts, categories, budget, settings })}
          >
            <RowIcon icon={<FileJson className="h-[18px] w-[18px] text-white" />} bg="#007AFF" />
            <span className="flex-1 text-left text-[16px] text-ios-label dark:text-white">导出备份（JSON）</span>
            <Download className="h-4 w-4 text-ios-secondary opacity-40" />
          </button>
          <RowDivider />
          <button
            className="flex w-full items-center gap-3 px-4 py-3 active:bg-black/[0.03] dark:active:bg-white/[0.04]"
            onClick={() => exportCSV(transactions, categories, accounts)}
          >
            <RowIcon icon={<FileSpreadsheet className="h-[18px] w-[18px] text-white" />} bg="#34C759" />
            <span className="flex-1 text-left text-[16px] text-ios-label dark:text-white">导出明细（CSV）</span>
            <Download className="h-4 w-4 text-ios-secondary opacity-40" />
          </button>
          <RowDivider />
          <button
            className="flex w-full items-center gap-3 px-4 py-3 active:bg-black/[0.03] dark:active:bg-white/[0.04]"
            onClick={() => fileRef.current?.click()}
          >
            <RowIcon icon={<Upload className="h-[18px] w-[18px] text-white" />} bg="#32ADE6" />
            <span className="flex-1 text-left text-[16px] text-ios-label dark:text-white">导入备份</span>
            <ChevronRight className="h-4 w-4 text-ios-secondary opacity-40" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
              e.target.value = ''; // 允许重复选择同一文件
            }}
          />
          <RowDivider />
          <button
            className="flex w-full items-center gap-3 px-4 py-3 active:bg-black/[0.03] dark:active:bg-white/[0.04]"
            onClick={() => setClearConfirm(true)}
          >
            <RowIcon icon={<Trash2 className="h-[18px] w-[18px] text-white" />} bg="#FF3B30" />
            <span className="flex-1 text-left text-[16px] text-ios-red">清空全部数据</span>
          </button>
        </Section>

        {/* 其他 */}
        <Section title="其他">
          <button className="flex w-full items-center gap-3 px-4 py-3 active:bg-black/[0.03] dark:active:bg-white/[0.04]" onClick={() => navigate('/accounts')}>
            <RowIcon icon={<Wallet className="h-[18px] w-[18px] text-white" />} bg="#34C759" />
            <span className="flex-1 text-left text-[16px] text-ios-label dark:text-white">账户管理</span>
            <ChevronRight className="h-4 w-4 text-ios-secondary opacity-40" />
          </button>
          <RowDivider />
          <button className="flex w-full items-center gap-3 px-4 py-3 active:bg-black/[0.03] dark:active:bg-white/[0.04]" onClick={() => navigate('/budget')}>
            <RowIcon icon={<Target className="h-[18px] w-[18px] text-white" />} bg="#AF52DE" />
            <span className="flex-1 text-left text-[16px] text-ios-label dark:text-white">预算设置</span>
            <ChevronRight className="h-4 w-4 text-ios-secondary opacity-40" />
          </button>
          <RowDivider />
          <button className="flex w-full items-center gap-3 px-4 py-3 active:bg-black/[0.03] dark:active:bg-white/[0.04]" onClick={() => navigate('/about')}>
            <RowIcon icon={<Info className="h-[18px] w-[18px] text-white" />} bg="#8E8E93" />
            <span className="flex-1 text-left text-[16px] text-ios-label dark:text-white">关于轻记账</span>
            <ChevronRight className="h-4 w-4 text-ios-secondary opacity-40" />
          </button>
        </Section>

        <p className="pb-2 text-center text-[12px] text-ios-secondary">
          轻记账 v{APP_VERSION} · 数据仅保存在本机浏览器
        </p>
      </div>

      {/* 货币选择 */}
      {currencyOpen && (
        <Sheet open={currencyOpen} onClose={() => setCurrencyOpen(false)}>
          <div className="pb-safe">
            <h3 className="pb-2 text-center text-[17px] font-semibold text-ios-label dark:text-white">
              货币单位
            </h3>
            <div className="px-3 pb-4">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  className="flex w-full items-center gap-3 rounded-btn px-2 py-3 text-left active:bg-black/5 dark:active:bg-white/10"
                  onClick={() => {
                    useStore.getState().updateSettings({ currency: c.symbol });
                    setCurrencyOpen(false);
                  }}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ios-bg text-[16px] font-semibold text-ios-label dark:bg-ios-darkcard2 dark:text-white">
                    {c.symbol}
                  </span>
                  <span className="flex-1 text-[16px] text-ios-label dark:text-white">{c.label}</span>
                  {settings.currency === c.symbol && (
                    <span className="h-2.5 w-2.5 rounded-full bg-ios-blue" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </Sheet>
      )}

      <ConfirmDialog
        open={clearConfirm}
        title="清空全部数据？"
        message="所有交易、账户、预算与设置都将恢复初始状态，且无法撤销。建议先导出备份。"
        confirmText="清空"
        destructive
        onConfirm={() => {
          useStore.getState().resetAll();
          showToast('已恢复初始状态');
        }}
        onClose={() => setClearConfirm(false)}
      />
    </Page>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 px-4 text-[13px] font-medium uppercase text-ios-secondary">{title}</p>
      <div className="overflow-hidden rounded-card bg-white dark:bg-ios-darkcard">{children}</div>
    </div>
  );
}

function RowIcon({ icon, bg }: { icon: React.ReactNode; bg: string }) {
  return (
    <span
      className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px]"
      style={{ backgroundColor: bg }}
    >
      {icon}
    </span>
  );
}

function RowDivider() {
  return <div className="ml-[54px] border-t-[0.5px] border-ios-separator dark:border-white/[0.12]" />;
}
