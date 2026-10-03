import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

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
 * iOS 弹窗（Alert）样式确认框。
 * 与 Sheet 相同的「延迟卸载」方案，避免 AnimatePresence 退场不卸载的风险。
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

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), 200);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-8 ${open ? '' : 'pointer-events-none'}`}>
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-[270px] overflow-hidden rounded-sheet bg-white/95 text-center backdrop-blur-xl dark:bg-[#2C2C2E]/95"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={open ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
      >
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
      </motion.div>
    </div>
  );
}
