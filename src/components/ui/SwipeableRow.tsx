import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface SwipeableRowProps {
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  /** 多选模式下禁用滑动并自动收回 */
  disabled?: boolean;
}

const ACTIONS_WIDTH = 152; // 两个 76px 操作按钮

/**
 * 左滑操作行：左滑露出「编辑 / 删除」，滑过一半吸附展开，点按收起。
 * 桌面端鼠标拖拽同样可用。
 */
export function SwipeableRow({ children, onEdit, onDelete, disabled }: SwipeableRowProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  return (
    <div className="relative overflow-hidden">
      {/* 背后的操作按钮 */}
      <div className="absolute inset-y-0 right-0 flex">
        {onEdit && (
          <button
            className="flex h-full w-[76px] flex-col items-center justify-center gap-0.5 bg-ios-blue text-white active:opacity-80"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            <Pencil className="h-5 w-5" />
            <span className="text-[11px]">编辑</span>
          </button>
        )}
        {onDelete && (
          <button
            className="flex h-full w-[76px] flex-col items-center justify-center gap-0.5 bg-ios-red text-white active:opacity-80"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <Trash2 className="h-5 w-5" />
            <span className="text-[11px]">删除</span>
          </button>
        )}
      </div>

      {/* 前景内容：可水平拖拽 */}
      <motion.div
        className="relative bg-white dark:bg-ios-darkcard"
        animate={{ x: open ? -ACTIONS_WIDTH : 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 42 }}
        drag={disabled ? false : 'x'}
        dragDirectionLock
        dragConstraints={{ left: -ACTIONS_WIDTH, right: 0 }}
        dragElastic={0.06}
        dragMomentum={false}
        onDragEnd={(_, info) => setOpen(info.offset.x < -ACTIONS_WIDTH / 2)}
        onClick={() => open && setOpen(false)}
      >
        {children}
      </motion.div>
    </div>
  );
}
