import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageProps {
  title: string;
  /** 大标题模式（iOS Large Title）：随内容滚动，导航栏滚动后浮现小标题 */
  large?: boolean;
  back?: boolean;
  /** 导航栏右侧按钮区 */
  right?: ReactNode;
  /** Tab 页面：底部预留 TabBar + 安全区高度 */
  tabPadding?: boolean;
  children: ReactNode;
}

/**
 * 页面骨架：固定毛玻璃导航栏（44px + 顶部安全区）+ 大标题 + 内容区。
 * 桌面端限制 430px 居中，模拟手机预览。
 */
export function Page({ title, large, back, right, tabPadding, children }: PageProps) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // 页面切换时回到顶部，并监听滚动以切换导航栏状态
  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goBack = () => {
    // 有历史则返回，否则回首页（处理直接打开二级页的场景）
    if (window.history.state && window.history.state.idx > 0) navigate(-1);
    else navigate('/');
  };

  return (
    <div
      className={
        tabPadding
          ? 'pb-[calc(72px+env(safe-area-inset-bottom))]'
          : 'pb-[calc(24px+env(safe-area-inset-bottom))]'
      }
    >
      {/* 固定导航栏 */}
      <header
        className={`fixed left-1/2 top-0 z-40 w-full max-w-[430px] -translate-x-1/2 pt-safe transition-all duration-200 ${
          scrolled
            ? 'border-b-[0.5px] border-ios-separator bg-white/70 backdrop-blur-xl dark:border-ios-darkseparator dark:bg-black/60'
            : 'border-b-[0.5px] border-transparent bg-ios-bg dark:bg-ios-darkbg'
        }`}
      >
        <div className="relative flex h-11 items-center justify-center px-2">
          {back && (
            <button
              className="absolute left-1 flex h-11 w-11 items-center justify-center text-ios-blue active:opacity-50"
              onClick={goBack}
              aria-label="返回"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {(!large || scrolled) && (
            <span className="text-[17px] font-semibold text-ios-label dark:text-white">
              {title}
            </span>
          )}
          <div className="absolute right-2 flex items-center">{right}</div>
        </div>
      </header>

      {/* 内容：顶部让出导航栏高度 */}
      <div className="pt-[calc(env(safe-area-inset-top)+44px)]">
        {large && (
          <h1 className="px-5 pb-2 pt-1 text-[34px] font-bold leading-tight tracking-tight text-ios-label dark:text-white">
            {title}
          </h1>
        )}
        {children}
      </div>
    </div>
  );
}
