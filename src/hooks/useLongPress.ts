import { useCallback, useRef } from 'react';

/**
 * 长按手势（用于进入多选模式）。
 * 移动超过 10px 视为滑动/滚动，自动取消长按。
 */
export function useLongPress(onLongPress: () => void, ms = 500) {
  const timer = useRef<number | null>(null);
  const cbRef = useRef(onLongPress);
  cbRef.current = onLongPress;

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const sx = e.clientX;
      const sy = e.clientY;

      const cancel = () => {
        if (timer.current !== null) {
          window.clearTimeout(timer.current);
          timer.current = null;
        }
        window.removeEventListener('pointermove', move);
      };
      const move = (ev: PointerEvent) => {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 10) cancel();
      };

      timer.current = window.setTimeout(() => {
        cancel();
        cbRef.current();
      }, ms);
      window.addEventListener('pointermove', move, { passive: true });
      window.addEventListener('pointerup', cancel, { once: true });
      window.addEventListener('pointercancel', cancel, { once: true });
    },
    [ms],
  );

  return { onPointerDown };
}
