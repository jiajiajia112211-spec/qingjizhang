import {
  Banknote,
  BookOpen,
  Briefcase,
  Car,
  CircleDollarSign,
  CircleEllipsis,
  CreditCard,
  Gamepad2,
  Gift,
  Landmark,
  MessageCircle,
  ShoppingBag,
  Smartphone,
  Stethoscope,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

/** 图标 key -> lucide 组件 的映射表，分类与账户共用 */
const ICON_MAP: Record<string, LucideIcon> = {
  // 支出分类
  food: UtensilsCrossed,
  transport: Car,
  shopping: ShoppingBag,
  housing: Wallet,
  fun: Gamepad2,
  medical: Stethoscope,
  education: BookOpen,
  telecom: Smartphone,
  other: CircleEllipsis,
  // 收入分类
  salary: Banknote,
  bonus: Gift,
  invest: TrendingUp,
  parttime: Briefcase,
  'other-inc': CircleDollarSign,
  // 账户
  cash: Banknote,
  bank: Landmark,
  alipay: Wallet,
  wechat: MessageCircle,
  credit: CreditCard,
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? CircleEllipsis;
}

export function CategoryIcon({
  name,
  className,
  strokeWidth,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = getIcon(name);
  return <Icon className={className} strokeWidth={strokeWidth} />;
}
