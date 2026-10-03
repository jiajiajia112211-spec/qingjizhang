import { Github, Info } from 'lucide-react';
import { Page } from '../components/layout/Page';

const APP_VERSION = '1.0.0';

const TECHS = [
  'React 18',
  'TypeScript',
  'Vite',
  'Tailwind CSS',
  'Zustand',
  'React Router',
  'Recharts',
  'Framer Motion',
  'date-fns',
  'lucide-react',
  'vite-plugin-pwa',
];

/** 关于页：应用介绍、技术栈与开源信息 */
export function AboutPage() {
  return (
    <Page title="关于" back>
      <div className="flex flex-col items-center px-6 pt-8">
        {/* App 图标 */}
        <div className="flex h-[88px] w-[88px] items-center justify-center rounded-[20px] bg-gradient-to-b from-[#2E9BFF] to-[#0067D8] shadow-lg shadow-ios-blue/30">
          <span className="text-[44px] font-bold leading-none text-white">¥</span>
        </div>
        <h2 className="mt-3 text-[22px] font-bold text-ios-label dark:text-white">轻记账</h2>
        <p className="text-[13px] text-ios-secondary">Version {APP_VERSION}</p>

        <p className="mt-5 text-center text-[14px] leading-6 text-ios-label dark:text-[#D1D1D6]">
          一款简洁优雅的 iOS 风格记账应用。
          <br />
          纯前端实现、数据完全存储在本机浏览器，
          <br />
          支持离线使用与添加到主屏幕。
        </p>

        <div className="mt-6 w-full rounded-card bg-white p-4 dark:bg-ios-darkcard">
          <p className="mb-2 text-[13px] font-semibold text-ios-secondary">技术栈</p>
          <div className="flex flex-wrap gap-2">
            {TECHS.map((t) => (
              <span
                key={t}
                className="rounded-full bg-ios-bg px-2.5 py-1 text-[12px] font-medium text-ios-label dark:bg-ios-darkcard2 dark:text-white"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 w-full rounded-card bg-white dark:bg-ios-darkcard">
          <a
            className="flex items-center gap-3 px-4 py-3 active:bg-black/[0.03] dark:active:bg-white/[0.04]"
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
          >
            <Github className="h-5 w-5 text-ios-label dark:text-white" />
            <span className="flex-1 text-[16px] text-ios-label dark:text-white">GitHub 仓库</span>
          </a>
          <div className="flex items-center gap-3 border-t-[0.5px] border-ios-separator px-4 py-3 dark:border-white/[0.12]">
            <Info className="h-5 w-5 text-ios-secondary" />
            <span className="flex-1 text-[13px] leading-5 text-ios-secondary">
              本应用为开源项目，基于 MIT 协议发布。数据请自行通过「设置 → 导出备份」妥善保管。
            </span>
          </div>
        </div>

        <p className="py-6 text-[12px] text-ios-secondary">Made with ❤️ · MIT License</p>
      </div>
    </Page>
  );
}
