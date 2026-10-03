/** 数字与金额格式化，以及数字键盘表达式的解析 */

/** 千分位分组整数部分 */
export function groupDigits(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** 金额格式化：-1234.5 -> -¥1,234.50 */
export function formatMoney(n: number, symbol = '¥'): string {
  const abs = Math.abs(n);
  const s = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = n < 0 ? '-' : '';
  return `${sign}${symbol}${s}`;
}

/** 不带小数的大额缩写（图表轴用）：12345 -> 1.2万 */
export function formatCompact(n: number): string {
  if (Math.abs(n) >= 100000) return `${(n / 10000).toFixed(1)}万`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
}

/**
 * 数字键盘表达式求值：支持加减与一位小数。
 * "12.5+3-1" -> 14.5，按从左到右顺序计算。
 */
export function evalExpr(expr: string): number {
  if (!expr) return 0;
  const tokens = expr.match(/(\d+\.?\d*|[+-])/g) ?? [];
  let total = 0;
  let op: '+' | '-' = '+';
  for (const t of tokens) {
    if (t === '+' || t === '-') {
      op = t;
    } else {
      const v = parseFloat(t);
      total = op === '+' ? total + v : total - v;
    }
  }
  // 规避浮点误差，保留两位
  return Math.round(total * 100) / 100;
}

/** 按键后返回新的表达式（含合法性校验：小数位数、连续运算符、前导零等） */
export function pressKey(expr: string, key: string): string {
  const lastOpIdx = Math.max(expr.lastIndexOf('+'), expr.lastIndexOf('-'));
  const operand = expr.slice(lastOpIdx + 1);

  if (key >= '0' && key <= '9') {
    if (operand.length >= 9) return expr;
    if (operand === '0') return expr.slice(0, lastOpIdx + 1) + key;
    if (operand.includes('.') && operand.split('.')[1].length >= 2) return expr;
    return expr + key;
  }
  if (key === '.') {
    if (operand.includes('.')) return expr;
    if (operand === '') return expr.slice(0, lastOpIdx + 1) + '0.';
    return expr + '.';
  }
  if (key === '+' || key === '-') {
    if (expr === '') return expr;
    const last = expr[expr.length - 1];
    if (last === '+' || last === '-') return expr.slice(0, -1) + key;
    if (last === '.') return expr.slice(0, -1) + key;
    return expr + key;
  }
  if (key === 'del') return expr.slice(0, -1);
  return expr;
}

/** 表达式展示格式化：1234.5+67 -> 1,234.5+67 */
export function formatExpression(expr: string): string {
  return expr.replace(/\d+(?:\.\d*)?/g, (m) => {
    const [i, d] = m.split('.');
    return d !== undefined ? `${groupDigits(i)}.${d}` : groupDigits(i);
  });
}
