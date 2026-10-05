import { useEffect, useState } from 'react';

/**
 * CSS 过渡的「进场门控」：open 翻 true 后等待两帧再应用目标类名，
 * 确保「关闭位」样式先完成一次提交，transition 才能被触发。
 * 配合 CSS transition 使用——动画全程由合成器线程驱动，
 * 主线程的 React 渲染不会挤掉动画帧（这是 JS 驱动 spring 做不到的）。
 */
export function useEnterTransition(open: boolean): boolean {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setShown(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [open]);

  return shown;
}
