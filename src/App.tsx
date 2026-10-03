import { lazy, Suspense, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import { TabBar } from './components/layout/TabBar';
import { AddTransactionSheet } from './components/tx/AddTransactionSheet';
import { ToastHost } from './components/ui/Toast';
import { useTheme } from './hooks/useTheme';
import { HomePage } from './pages/HomePage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetPage } from './pages/BudgetPage';
import { AccountsPage } from './pages/AccountsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';

// Recharts 体积较大，统计页懒加载，避免拖慢首屏
const StatsPage = lazy(() => import('./pages/StatsPage'));

const TAB_PATHS = ['/', '/transactions', '/stats', '/settings'];

export default function App() {
  useTheme(); // 应用深色模式设置
  const location = useLocation();
  const isTabPage = TAB_PATHS.includes(location.pathname);

  // 空闲时预加载统计页 chunk（Recharts 体积大），切到统计页不再有加载卡顿
  useEffect(() => {
    const t = window.setTimeout(() => {
      import('./pages/StatsPage');
    }, 2000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    // 桌面端 430px 居中模拟手机预览
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-ios-bg text-ios-label shadow-[0_0_60px_rgba(0,0,0,0.12)] dark:bg-ios-darkbg dark:text-white">
      {/* 页面切换只做入场动画：AnimatePresence 的退场追踪在本场景下可能不解析，
          导致旧页面滞留。key 变化时旧页立即卸载、新页淡入，行为确定。 */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route
              path="/stats"
              element={
                <Suspense fallback={null}>
                  <StatsPage />
                </Suspense>
              }
            />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </motion.div>

      {/* 仅 Tab 页显示底部导航 */}
      {isTabPage && <TabBar />}

      {/* 全局「记一笔」面板与 Toast */}
      <AddTransactionSheet />
      <ToastHost />
    </div>
  );
}
