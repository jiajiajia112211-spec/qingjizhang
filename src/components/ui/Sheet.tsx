import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useEnterTransition } from '../../hooks/useEnterTransition';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** 内容区额外类名（控制高度、布局等） */
  className?: string;
  /**
   * 常驻挂载：首次打开后不再卸载（隐藏在屏下）。
   * 适合内容较重的弹窗（如记账面板），再次打开时零挂载成本。
   */
  keepMounted?: boolean;
}

interface DragState {
  startY: number;
  dy: number;
  lastY: number;
  lastT: number;
  v: number;
}

/**
 * iOS 风格底部弹窗。
 *
 * 动画完全由 CSS transition 驱动（合成器线程）：transform/opacity 不受
 * 主线程 React 渲染影响，打开面板时的渲染再忙也不会掉动画帧。
 * 关闭手势为自实现的把手下拉（pointer 事件 + 速度阈值）。
 */
export function Sheet({ open, onClose, children, className = '', keepMounted }: SheetProps) {
  const [mounted, setMounted] = useState(open);
  const shown = useEnterTransition(open);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    // keepMounted：退场后保留在 DOM（屏下隐藏），下次打开零挂载成本
    if (keepMounted) return;
    const t = window.setTimeout(() => setMounted(false), 420);
    return () => window.clearTimeout(t);
  }, [open, keepMounted]);

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

  const onDragMove = useCallback((e: PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    d.dy = Math.max(0, e.clientY - d.startY);
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) {
      d.v = (e.clientY - d.lastY) / dt;
      d.lastY = e.clientY;
      d.lastT = e.timeStamp;
    }
    const el = panelRef.current;
    if (el && d.dy > 0) el.style.transform = `translateY(${d.dy}px)`;
  }, []);

  const onDragEnd = useCallback(() => {
    const d = dragRef.current;
    dragRef.current = null;
    const el = panelRef.current;
    // 清掉内联样式，交还给 CSS 类过渡：自然回弹或继续滑出
    if (el) {
      el.style.transition = '';
      el.style.transform = '';
    }
    if (d && (d.dy > 120 || d.v > 0.6)) onCloseRef.current();
  }, []);

  const onGrabberDown = useCallback(
    (e: React.PointerEvent) => {
      if (dragRef.current) return;
      dragRef.current = { startY: e.clientY, dy: 0, lastY: e.clientY, lastT: e.timeStamp, v: 0 };
      const el = panelRef.current;
      if (el) el.style.transition = 'none';
      window.addEventListener('pointermove', onDragMove);
      window.addEventListener('pointerup', onDragEnd, { once: true });
      window.addEventListener('pointercancel', onDragEnd, { once: true });
    },
    [onDragMove, onDragEnd],
  );

  // 卸载时兜底清理拖拽监听
  useEffect(
    () => () => {
      window.removeEventListener('pointermove', onDragMove);
    },
    [onDragMove],
  );

  if (!mounted) return null;

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 ${open && shown ? 'sheet-open' : 'sheet-closed'} ${
        open ? '' : 'pointer-events-none'
      }`}
    >
      {/* 遮罩 */}
      <div className="sheet-backdrop gpu-layer absolute inset-0" onClick={onClose} />
      {/* 面板：inset-x-0 + mx-auto 居中，避免 transform 与定位冲突 */}
      <div
        ref={panelRef}
        className={`sheet-panel gpu-layer absolute inset-x-0 bottom-0 mx-auto w-full max-w-[430px] rounded-t-sheet bg-white dark:bg-ios-darkcard ${className}`}
      >
        {/* 把手：下拉关闭 */}
        <div
          className="no-select flex touch-none cursor-grab justify-center py-2.5 active:cursor-grabbing"
          onPointerDown={onGrabberDown}
        >
          <div className="h-1.5 w-9 rounded-full bg-black/15 dark:bg-white/25" />
        </div>
        {children}
      </div>
    </div>
  );
}
