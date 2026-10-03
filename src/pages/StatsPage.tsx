import { useMemo, useState } from 'react';
import { startOfMonth, subMonths, addMonths, format } from 'date-fns';
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowDownRight, ArrowUpRight, ChartPie, ChevronLeft, ChevronRight } from 'lucide-react';
import { Page } from '../components/layout/Page';
import { EmptyState } from '../components/ui/EmptyState';
import { useStore } from '../store/useStore';
import { useSystemDark } from '../hooks/useIsDark';
import { formatMoney, formatCompact } from '../utils/format';
import { categoryTotals, monthStats, monthsTrend } from '../utils/tx';
import { CategoryIcon } from '../constants/icons';
import type { CategoryTotal } from '../utils/tx';

/** 统计页：月度趋势、分类占比、分类排行、月度对比 */
export function StatsPage() {  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);
  const systemDark = useSystemDark();

  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const cur = useMemo(() => monthStats(transactions, month), [transactions, month]);
  const prev = useMemo(() => monthStats(transactions, subMonths(month, 1)), [transactions, month]);
  const trend = useMemo(() => monthsTrend(transactions, month, 6), [transactions, month]);
  const catTotals = useMemo(() => categoryTotals(transactions, month, 'expense'), [transactions, month]);

  const prevTotals = useMemo(
    () => categoryTotals(transactions, subMonths(month, 1), 'expense'),
    [transactions, month],
  );

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? '未知分类';
  const catColor = (id: string) => categories.find((c) => c.id === id)?.color ?? '#8E8E93';

  const pieData: Array<{ name: string; value: number; id: string }> = catTotals.map((t) => ({
    id: t.categoryId,
    name: catName(t.categoryId),
    value: t.total,
  }));

  const tickColor = systemDark ? '#8E8E93' : '#8E8E93';
  const gridColor = systemDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  const labelColor = systemDark ? '#FFFFFF' : '#000000';
  const cardBg = systemDark ? 'rgba(28,28,30,0.92)' : 'rgba(255,255,255,0.95)';

  return (
    <Page title="统计" large tabPadding>
      <div className="space-y-3 px-4">
        {/* 月份切换 */}
        <div className="flex items-center justify-between rounded-card bg-white px-2 py-1.5 dark:bg-ios-darkcard">
          <button
            className="flex h-10 w-10 items-center justify-center text-ios-blue active:opacity-50"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            aria-label="上一月"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-[16px] font-semibold text-ios-label dark:text-white">
            {format(month, 'yyyy年M月')}
          </span>
          <button
            className="flex h-10 w-10 items-center justify-center text-ios-blue disabled:opacity-30 active:opacity-50"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            disabled={month >= startOfMonth(new Date())}
            aria-label="下一月"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* 本月收支概览 */}
        <div className="grid grid-cols-3 rounded-card bg-white py-3 dark:bg-ios-darkcard">
          <StatCol label="收入" value={formatMoney(cur.income, currency)} className="text-ios-green" />
          <StatCol
            label="支出"
            value={formatMoney(cur.expense, currency)}
            className="text-ios-label dark:text-white"
            divider
          />
          <StatCol
            label="结余"
            value={formatMoney(cur.balance, currency)}
            className={cur.balance < 0 ? 'text-ios-red' : 'text-ios-label dark:text-white'}
            divider
          />
        </div>

        {/* 近 6 个月收支趋势 */}
        <div className="rounded-card bg-white p-4 dark:bg-ios-darkcard">
          <CardTitle text="收支趋势" desc="近 6 个月" />
          <div className="mt-1 flex justify-center gap-4 text-[12px] text-ios-secondary">
            <span className="flex items-center gap-1">
              <i className="h-2 w-2 rounded-full bg-ios-green" /> 收入
            </span>
            <span className="flex items-center gap-1">
              <i className="h-2 w-2 rounded-full bg-ios-red" /> 支出
            </span>
          </div>
          <div className="mt-2 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34C759" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#34C759" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF3B30" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#FF3B30" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: tickColor, fontSize: 11 }}
                  dy={6}
                />
                <YAxis
                  width={44}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: tickColor, fontSize: 10 }}
                  tickFormatter={(v: number) => formatCompact(v)}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: 'none',
                    background: cardBg,
                    color: labelColor,
                    fontSize: 12,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  }}
                  formatter={(value) => formatMoney(Number(value), currency)}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="收入"
                  stroke="#34C759"
                  strokeWidth={2}
                  fill="url(#gIncome)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="支出"
                  stroke="#FF3B30"
                  strokeWidth={2}
                  fill="url(#gExpense)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 分类占比 + 排行 */}
        {catTotals.length === 0 ? (
          <div className="rounded-card bg-white dark:bg-ios-darkcard">
            <EmptyState
              icon={ChartPie}
              title={`${format(month, 'M')} 月暂无支出`}
              subtitle="记几笔支出后就能看到分类统计"
            />
          </div>
        ) : (
          <div className="rounded-card bg-white p-4 dark:bg-ios-darkcard">
            <CardTitle text="支出分类占比" />
            <div className="relative mx-auto h-52 w-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="64%"
                    outerRadius="94%"
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {pieData.map((d) => (
                      <Cell key={d.id} fill={catColor(d.id)} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: 'none',
                      background: cardBg,
                      color: labelColor,
                      fontSize: 12,
                    }}
                    formatter={(value) => formatMoney(Number(value), currency)}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* 环心汇总 */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[11px] text-ios-secondary">本月支出</span>
                <span className="text-[20px] font-bold tabular-nums text-ios-label dark:text-white">
                  {formatMoney(cur.expense, currency)}
                </span>
              </div>
            </div>

            {/* 排行列表 */}
            <div className="mt-3 space-y-3">
              {catTotals.map((t: CategoryTotal, i) => {
                const pct = cur.expense > 0 ? t.total / cur.expense : 0;
                return (
                  <div key={t.categoryId} className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: catColor(t.categoryId) }}
                    >
                      <CategoryIcon
                        name={categories.find((c) => c.id === t.categoryId)?.icon ?? 'other'}
                        className="h-4 w-4 text-white"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[15px] font-medium text-ios-label dark:text-white">
                          <span className="mr-1 text-[12px] text-ios-secondary">{i + 1}.</span>
                          {catName(t.categoryId)}
                        </span>
                        <span className="text-[15px] font-semibold tabular-nums text-ios-label dark:text-white">
                          {formatMoney(t.total, currency)}
                          <span className="ml-1.5 text-[12px] font-normal text-ios-secondary">
                            {Math.round(pct * 100)}%
                          </span>
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.1]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct * 100}%`, backgroundColor: catColor(t.categoryId) }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 与上月对比 */}
        <div className="rounded-card bg-white p-4 dark:bg-ios-darkcard">
          <CardTitle text="月度对比" desc="vs 上月" />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <CompareCell
              label="收入变化"
              cur={cur.income}
              prev={prev.income}
              currency={currency}
              goodWhenUp
            />
            <CompareCell
              label="支出变化"
              cur={cur.expense}
              prev={prev.expense}
              currency={currency}
              goodWhenUp={false}
            />
          </div>
          {/* 分类级对比 */}
          {catTotals.length > 0 && (
            <div className="mt-3 space-y-2 border-t-[0.5px] border-ios-separator pt-3 dark:border-white/10">
              {catTotals.slice(0, 5).map((t) => {
                const p = prevTotals.find((x) => x.categoryId === t.categoryId)?.total ?? 0;
                const diff = t.total - p;
                const up = diff > 0;
                return (
                  <div key={t.categoryId} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[14px] text-ios-label dark:text-white">
                      <i
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: catColor(t.categoryId) }}
                      />
                      {catName(t.categoryId)}
                    </span>
                    <span className="flex items-center gap-1 text-[13px] tabular-nums">
                      <span className="text-ios-secondary dark:text-[#98989F]">
                        {formatMoney(t.total, currency)}
                      </span>
                      {diff !== 0 && (
                        <span
                          className={`flex items-center text-[12px] font-medium ${
                            up ? 'text-ios-red' : 'text-ios-green'
                          }`}
                        >
                          {up ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {formatMoney(Math.abs(diff), currency)}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}

function StatCol({
  label,
  value,
  className,
  divider,
}: {
  label: string;
  value: string;
  className: string;
  divider?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-0.5 ${
        divider ? 'border-x-[0.5px] border-ios-separator dark:border-white/10' : ''
      }`}
    >
      <span className="text-[12px] text-ios-secondary">{label}</span>
      <span className={`text-[15px] font-semibold tabular-nums ${className}`}>{value}</span>
    </div>
  );
}

function CardTitle({ text, desc }: { text: string; desc?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h3 className="text-[16px] font-semibold text-ios-label dark:text-white">{text}</h3>
      {desc && <span className="text-[12px] text-ios-secondary">{desc}</span>}
    </div>
  );
}

function CompareCell({
  label,
  cur,
  prev,
  currency,
  goodWhenUp,
}: {
  label: string;
  cur: number;
  prev: number;
  currency: string;
  goodWhenUp: boolean;
}) {
  const diff = cur - prev;
  const up = diff > 0;
  const good = goodWhenUp ? up : !up && diff !== 0;
  return (
    <div className="rounded-btn bg-ios-bg p-3 dark:bg-ios-darkcard2">
      <p className="text-[12px] text-ios-secondary">{label}</p>
      <p className="mt-0.5 text-[18px] font-bold tabular-nums text-ios-label dark:text-white">
        {formatMoney(cur, currency)}
      </p>
      <p
        className={`mt-0.5 flex items-center gap-0.5 text-[12px] font-medium ${
          diff === 0 ? 'text-ios-secondary' : good ? 'text-ios-green' : 'text-ios-red'
        }`}
      >
        {diff === 0 ? (
          '与上月持平'
        ) : (
          <>
            {up ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {up ? '增' : '减'}
            {formatMoney(Math.abs(diff), currency)}
          </>
        )}
      </p>
    </div>
  );
}

export default StatsPage;
