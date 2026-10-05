import { useEffect, useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { useEnterTransition } from '../../hooks/useEnterTransition';
import { useUIStore, type ToastMsg } from '../../store/useUIStore';

/**
 * iOS 风格 Toast：顶部居中深色胶囊，支持成功 / 警告样式与「撤销」动作按钮。
 * 2.4s 无动作自动消失；带动作时延长到 4s。
 * 进出场为 CSS 过渡（合成器线程），不依赖 JS 逐帧动画。
 */
export function ToastHost() {
  const toast = useUIStore((s) => s.toast);
  const hideToast = useUIStore((s) => s.hideToast);
  const [rendered, setRendered] = useState<ToastMsg | null>(null);
  const shown = useEnterTransition(!!toast);

  // 新 Toast 立即渲染；消失时等退场动画结束后再卸载
  useEffect(() => {
    if (toast) {
      setRendered(toast);
      return;
    }
    const t = window.setTimeout(() => setRendered(null), 280);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!toast) return;
    const delay = toast.action ? 4000 : 2400;
    const timer = window.setTimeout(hideToast, delay);
    return () => window.clearTimeout(timer);
  }, [toast, hideToast]);

  return (
    /* 外层负责居中定位，内层为 CSS 过渡 */
    <div
      aria-hidden={!toast}
      className={`pointer-events-none fixed left-1/2 top-[calc(env(safe-area-inset-top)+10px)] z-[70] flex w-full max-w-[430px] -translate-x-1/2 justify-center ${
        shown && toast ? 'toast-show' : ''
      }`}
    >
      {rendered && (
        <div className="toast-pill pointer-events-auto">
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
        </div>
      )}
    </div>
  );
}
