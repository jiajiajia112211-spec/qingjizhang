import { useEffect, useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { SegmentedControl } from '../ui/SegmentedControl';
import { CategoryIcon } from '../../constants/icons';
import { useStore } from '../../store/useStore';
import { EMPTY_FILTER } from '../../utils/tx';
import type { TxFilter, TxType } from '../../types';

interface FilterSheetProps {
  open: boolean;
  value: TxFilter;
  onChange: (f: TxFilter) => void;
  onClose: () => void;
}

type TypeOption = 'all' | TxType;

/** 明细筛选弹窗：类型 / 分类 / 账户 / 金额范围 / 日期区间，条件实时生效 */
export function FilterSheet({ open, value, onChange, onClose }: FilterSheetProps) {
  const categories = useStore((s) => s.categories);
  const accounts = useStore((s) => s.accounts);
  const [draft, setDraft] = useState<TxFilter>(value);

  // 每次打开时同步外部筛选值到草稿
  useEffect(() => {
    if (open) setDraft(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const patch = (p: Partial<TxFilter>) => {
    const next = { ...draft, ...p };
    setDraft(next);
    onChange(next);
  };

  const toggleIn = (arr: string[], id: string): string[] =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="pb-safe">
        <div className="relative flex items-center justify-center pb-2">
          <h3 className="text-[17px] font-semibold text-ios-label dark:text-white">筛选</h3>
          <button
            className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.06] text-ios-secondary active:opacity-60 dark:bg-white/[0.12]"
            onClick={onClose}
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[62vh] space-y-4 overflow-y-auto px-4 pb-4">
          {/* 类型 */}
          <div>
            <SectionTitle text="类型" />
            <SegmentedControl<TypeOption>
              options={[
                { value: 'all', label: '全部' },
                { value: 'expense', label: '支出' },
                { value: 'income', label: '收入' },
                { value: 'transfer', label: '转账' },
              ]}
              value={draft.type}
              onChange={(v) => patch({ type: v })}
            />
          </div>

          {/* 分类多选 */}
          <div>
            <SectionTitle text="分类" />
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const active = draft.categoryIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    className={`flex items-center gap-1.5 rounded-full py-1.5 pl-2 pr-3 text-[13px] transition active:opacity-60 ${
                      active
                        ? 'bg-ios-blue text-white'
                        : 'bg-black/[0.05] text-ios-label dark:bg-white/[0.08] dark:text-white'
                    }`}
                    onClick={() => patch({ categoryIds: toggleIn(draft.categoryIds, c.id) })}
                  >
                    <CategoryIcon name={c.icon} className="h-3.5 w-3.5" />
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 账户多选 */}
          <div>
            <SectionTitle text="账户" />
            <div className="flex flex-wrap gap-2">
              {accounts.map((a) => {
                const active = draft.accountIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    className={`flex items-center gap-1.5 rounded-full py-1.5 pl-2 pr-3 text-[13px] transition active:opacity-60 ${
                      active
                        ? 'bg-ios-blue text-white'
                        : 'bg-black/[0.05] text-ios-label dark:bg-white/[0.08] dark:text-white'
                    }`}
                    onClick={() => patch({ accountIds: toggleIn(draft.accountIds, a.id) })}
                  >
                    <CategoryIcon name={a.icon} className="h-3.5 w-3.5" />
                    {a.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 金额范围 */}
          <div>
            <SectionTitle text="金额范围" />
            <div className="flex items-center gap-2">
              <NumInput
                placeholder="最小金额"
                value={draft.minAmount}
                onChange={(v) => patch({ minAmount: v })}
              />
              <span className="text-ios-secondary">—</span>
              <NumInput
                placeholder="最大金额"
                value={draft.maxAmount}
                onChange={(v) => patch({ maxAmount: v })}
              />
            </div>
          </div>

          {/* 日期区间 */}
          <div>
            <SectionTitle text="日期区间" />
            <div className="grid grid-cols-2 gap-2">
              <DateInput
                value={draft.from}
                onChange={(v) => patch({ from: v })}
              />
              <DateInput
                value={draft.to}
                onChange={(v) => patch({ to: v })}
              />
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex gap-3 border-t-[0.5px] border-ios-separator px-4 py-3 dark:border-white/10">
          <button
            className="h-11 flex-1 rounded-btn bg-black/[0.06] text-[16px] font-semibold text-ios-label active:opacity-60 dark:bg-white/[0.1] dark:text-white"
            onClick={() => {
              setDraft(EMPTY_FILTER);
              onChange(EMPTY_FILTER);
            }}
          >
            重置
          </button>
          <button
            className="h-11 flex-[2] rounded-btn bg-ios-blue text-[16px] font-semibold text-white active:opacity-80"
            onClick={onClose}
          >
            完成
          </button>
        </div>
      </div>
    </Sheet>
  );
}

function SectionTitle({ text }: { text: string }) {
  return (
    <p className="mb-1.5 text-[13px] font-medium text-ios-secondary dark:text-[#AEAEB2]">
      {text}
    </p>
  );
}

function NumInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      className="min-h-[40px] w-full rounded-btn bg-black/[0.05] px-3 text-[15px] text-ios-label outline-none placeholder:text-ios-secondary dark:bg-white/[0.08] dark:text-white"
    />
  );
}

function DateInput({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <label className="relative flex min-h-[40px] items-center justify-between gap-1 rounded-btn bg-black/[0.05] px-3 dark:bg-white/[0.08]">
      <span className={`text-[14px] ${value ? 'text-ios-label dark:text-white' : 'text-ios-secondary'}`}>
        {value ?? '开始日期'}
      </span>
      <ChevronRight className="h-3.5 w-3.5 text-ios-secondary opacity-60" />
      <input
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="absolute inset-0 h-full w-full opacity-0"
      />
    </label>
  );
}
