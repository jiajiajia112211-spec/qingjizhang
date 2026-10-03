import { useEffect, useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import type { ReactNode } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** 内容区额外类名（控制高度、布局等） */
  className?: string;
}

const EXIT_MS = 240; // 与退场动画时长保持一致

/**
 * iOS 风格底部弹窗：毛玻璃遮罩、spring 上滑、把手下拉关闭。
 *
 * 不使用 AnimatePresence：对其非 motion 直接子元素，退场动画完成后可能不卸载，
 * 留下透明遮罩挡住整个页面。这里用「open 后延迟卸载」确定性方案：
 * open=false 时先播放退场动画，EXIT_MS 后移除节点。
 */
export function Sheet({ open, onClose, children, className = '' }: SheetProps) {
  const dragControls = useDragControls();
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  // 弹窗打开时锁定背景滚动
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // 桌面端支持 Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      {/* 遮罩 */}
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      {/* 面板：inset-x-0 + mx-auto 居中，避免 transform 与动画冲突 */}
      <motion.div
        className={`absolute inset-x-0 bottom-0 mx-auto w-full max-w-[430px] rounded-t-sheet bg-white dark:bg-ios-darkcard ${className}`}
        initial={{ y: '100%' }}
        animate={open ? { y: 0 } : { y: '100%' }}
        transition={
          open
            ? { type: 'spring', damping: 32, stiffness: 340 }
            : { duration: 0.22, ease: [0.4, 0, 1, 1] }
        }
        drag="y"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          // 下滑超过 120px 或快速下滑时关闭
          if (info.offset.y > 120 || info.velocity.y > 700) onClose();
        }}
      >
        {/* 把手 */}
        <div
          className="flex cursor-grab justify-center py-2.5 active:cursor-grabbing"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="h-1.5 w-9 rounded-full bg-black/15 dark:bg-white/25" />
        </div>
        {children}
      </motion.div>
    </div>
  );
}
