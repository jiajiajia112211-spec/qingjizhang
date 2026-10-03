import type { Account, Category } from '../types';

/** 预置支出 / 收入分类（颜色使用 iOS 系统色） */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: '餐饮', type: 'expense', color: '#FF9500', icon: 'food' },
  { id: 'transport', name: '交通', type: 'expense', color: '#007AFF', icon: 'transport' },
  { id: 'shopping', name: '购物', type: 'expense', color: '#FF2D55', icon: 'shopping' },
  { id: 'housing', name: '居住', type: 'expense', color: '#5856D6', icon: 'housing' },
  { id: 'fun', name: '娱乐', type: 'expense', color: '#AF52DE', icon: 'fun' },
  { id: 'medical', name: '医疗', type: 'expense', color: '#30B0C7', icon: 'medical' },
  { id: 'education', name: '教育', type: 'expense', color: '#00C7BE', icon: 'education' },
  { id: 'telecom', name: '通讯', type: 'expense', color: '#32ADE6', icon: 'telecom' },
  { id: 'other-exp', name: '其他', type: 'expense', color: '#8E8E93', icon: 'other' },
  { id: 'salary', name: '工资', type: 'income', color: '#34C759', icon: 'salary' },
  { id: 'bonus', name: '奖金', type: 'income', color: '#FF9500', icon: 'bonus' },
  { id: 'invest', name: '投资', type: 'income', color: '#007AFF', icon: 'invest' },
  { id: 'parttime', name: '兼职', type: 'income', color: '#5856D6', icon: 'parttime' },
  { id: 'other-inc', name: '其他收入', type: 'income', color: '#8E8E93', icon: 'other' },
];

/** 预置账户：现金、银行卡、支付宝、微信、信用卡 */
export const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'cash', name: '现金', icon: 'cash', color: '#34C759', initialBalance: 0 },
  { id: 'bank', name: '银行卡', icon: 'bank', color: '#5856D6', initialBalance: 0 },
  { id: 'alipay', name: '支付宝', icon: 'alipay', color: '#1677FF', initialBalance: 0 },
  { id: 'wechat', name: '微信', icon: 'wechat', color: '#07C160', initialBalance: 0 },
  { id: 'credit', name: '信用卡', icon: 'credit', color: '#FF9500', initialBalance: 0 },
];

/** 新建账户时可选的图标预设 */
export const ACCOUNT_PRESETS: Array<Pick<Account, 'icon' | 'color'>> = [
  { icon: 'cash', color: '#34C759' },
  { icon: 'bank', color: '#5856D6' },
  { icon: 'alipay', color: '#1677FF' },
  { icon: 'wechat', color: '#07C160' },
  { icon: 'credit', color: '#FF9500' },
];

/** 设置页可选货币 */
export const CURRENCIES: Array<{ code: string; symbol: string; label: string }> = [
  { code: 'CNY', symbol: '¥', label: '人民币 CNY' },
  { code: 'USD', symbol: '$', label: '美元 USD' },
  { code: 'EUR', symbol: '€', label: '欧元 EUR' },
  { code: 'GBP', symbol: '£', label: '英镑 GBP' },
  { code: 'JPY', symbol: '￥', label: '日元 JPY' },
];
