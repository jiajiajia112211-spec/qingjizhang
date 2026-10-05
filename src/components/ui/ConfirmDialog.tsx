import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useEnterTransition } from '../../hooks/useEnterTransition';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  /** 危险操作时确认按钮为红色 */
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * iOS 弹窗（Alert）样式确认框，CSS 过渡驱动（合成器线程）。
 * 关闭时先播放退场动画再卸载。
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  destructive,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(open);
  const shown = useEnterTransition(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), 220);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[60] flex items-center justify-center p-8 ${
        shown && open ? 'confirm-open' : 'confirm-closed'
      } ${open ? '' : 'pointer-events-none'}`}
    >
      <div className="confirm-backdrop absolute inset-0" onClick={onClose} />
      <Card destructive={destructive} onClose={onClose} onConfirm={onConfirm} title={title} message={message} confirmText={confirmText} cancelText={cancelText} />
    </div>
  );
}

function Card({
  title,
  message,
  confirmText,
  cancelText,
  destructive,
  onConfirm,
  onClose,
}: {
  title: string;
  message?: ReactNode;
  confirmText: string;
  cancelText: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="confirm-card relative w-full max-w-[270px] overflow-hidden rounded-sheet bg-white/95 text-center backdrop-blur-xl dark:bg-[#2C2C2E]/95">
      <div className="px-4 pb-4 pt-5">
        <h3 className="text-[17px] font-semibold text-ios-label dark:text-white">{title}</h3>
        {message && (
          <p className="mt-1 text-[13px] leading-5 text-ios-secondary dark:text-[#AEAEB2]">
            {message}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 border-t-[0.5px] border-ios-separator dark:border-ios-darkseparator">
        <button
          className="h-11 border-r-[0.5px] border-ios-separator text-[17px] text-ios-label dark:border-ios-darkseparator dark:text-white active:bg-black/5 dark:active:bg-white/10"
          onClick={onClose}
        >
          {cancelText}
        </button>
        <button
          className={`h-11 text-[17px] font-semibold active:bg-black/5 dark:active:bg-white/10 ${
            destructive ? 'text-ios-red' : 'text-ios-blue'
          }`}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}
