import { NavLink, useLocation } from 'react-router-dom';
import { ChartPie, House, Plus, ReceiptText, Settings } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

const TABS = [
  { to: '/', icon: House, label: '首页' },
  { to: '/transactions', icon: ReceiptText, label: '明细' },
  null, // 中间为悬浮 "+" 记账按钮
  { to: '/stats', icon: ChartPie, label: '统计' },
  { to: '/settings', icon: Settings, label: '设置' },
] as const;

/**
 * 底部 Tab Bar：49px 高 + 底部安全区，毛玻璃背景，中央悬浮 "+"。
 * 仅在四个 Tab 页面渲染（由 App 控制）。
 */
export function TabBar() {
  const openAdd = useUIStore((s) => s.openAdd);
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2">
      {/* 中央 "+" 悬浮按钮：用 calc 定位；按压反馈走 CSS transform（合成器） */}
      <button
        aria-label="记一笔"
        className="absolute -top-[18px] left-[calc(50%-27px)] z-10 flex h-[54px] w-[54px] items-center justify-center rounded-full border-4 border-ios-bg bg-ios-blue text-white shadow-lg shadow-ios-blue/30 transition-transform duration-150 ease-out active:scale-90 dark:border-ios-darkbg"
        onClick={() => openAdd()}
      >
        <Plus className="h-7 w-7" strokeWidth={2.4} />
      </button>

      <div className="border-t-[0.5px] border-ios-separator bg-white/85 backdrop-blur-xl dark:border-ios-darkseparator dark:bg-[#1C1C1E]/85">
        <div className="flex h-[49px] pb-safe">
          {TABS.map((tab, i) =>
            tab === null ? (
              <div key={i} className="flex-1" />
            ) : (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `no-select flex flex-1 flex-col items-center justify-center gap-[3px] active:opacity-60 ${
                    isActive || (tab.to === '/' && location.pathname === '/')
                      ? 'text-ios-blue'
                      : 'text-ios-secondary dark:text-[#98989F]'
                  }`
                }
              >
                <tab.icon className="h-[22px] w-[22px]" strokeWidth={2} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </NavLink>
            ),
          )}
        </div>
      </div>
    </nav>
  );
}
