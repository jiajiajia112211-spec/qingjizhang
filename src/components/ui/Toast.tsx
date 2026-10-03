import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check } from 'lucide-react';
import { useUIStore, type ToastMsg } from '../../store/useUIStore';

/**
 * iOS 风格 Toast：顶部居中深色胶囊，支持成功 / 警告样式与「撤销」动作按钮。
 * 2.4s 无动作自动消失；带动作时延长到 4s。
 * 使用「延迟卸载」播放退场动画（不依赖 AnimatePresence）。
 */
export function ToastHost() {
  const toast = useUIStore((s) => s.toast);
  const hideToast = useUIStore((s) => s.hideToast);
  const [rendered, setRendered] = useState<ToastMsg | null>(null);

  // 新 Toast 立即渲染；消失时等退场动画结束后再卸载
  useEffect(() => {
    if (toast) {
      setRendered(toast);
      return;
    }
    const t = window.setTimeout(() => setRendered(null), 220);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!toast) return;
    const delay = toast.action ? 4000 : 2400;
    const timer = window.setTimeout(hideToast, delay);
    return () => window.clearTimeout(timer);
  }, [toast, hideToast]);

  const show = toast !== null;

  return (
    /* 外层负责居中定位（非 motion），内层负责动画，避免 transform 冲突 */
    <div className="pointer-events-none fixed left-1/2 top-[calc(env(safe-area-inset-top)+10px)] z-[70] flex w-full max-w-[430px] -translate-x-1/2 justify-center">
      {rendered && (
        <motion.div
          key={rendered.id}
          className="pointer-events-auto"
          initial={{ opacity: 0, y: -16, scale: 0.95 }}
          animate={show ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -16, scale: 0.95 }}
          transition={{ type: 'spring', damping: 28, stiffness: 400 }}
        >
          <div className="no-select flex items-center gap-2 rounded-full bg-[#1C1C1E]/95 px-4 py-2 text-[14px] text-white shadow-lg backdrop-blur-md">
            {rendered.type === 'warn' ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-ios-orange" />
            ) : (
              <Check className="h-4 w-4 shrink-0 text-ios-green" />
            )}
            <span className="max-w-[220px] truncate">{rendered.message}</span>
            {rendered.action && (
              <button
                className="ml-1 border-l border-white/20 pl-3 font-semibold text-ios-blue active:opacity-60"
                onClick={() => {
                  rendered.action?.run();
                  hideToast();
                }}
              >
                {rendered.action.label}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
