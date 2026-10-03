/**
 * PWA 图标生成脚本：纯 Node + pngjs，程序化绘制「¥」应用图标。
 * 产物：public/icons/ 下 192 / 512（圆角）、512 maskable（全出血）、apple-touch-icon 180。
 * 运行：npm run icons
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(root, '../public/icons');
fs.mkdirSync(outDir, { recursive: true });

// 背景渐变（自 #007AFF 派生）
const TOP = [64, 156, 255];
const BOTTOM = [0, 103, 216];

/** 「¥」字形线段（0~1 归一化坐标） */
const SEGMENTS = [
  [0.328, 0.234, 0.5, 0.492], // 左斜
  [0.672, 0.234, 0.5, 0.492], // 右斜
  [0.5, 0.492, 0.5, 0.766], // 竖笔
  [0.359, 0.566, 0.641, 0.566], // 上横
  [0.359, 0.656, 0.641, 0.656], // 下横
];
const HALF_STROKE = 0.0390625; // 40px @512 / 2

/** 点到线段的距离 */
function segDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/** 圆角矩形 signed distance（正值在外） */
function roundedRectSDF(px, py, half, radius) {
  const qx = Math.abs(px) - (half - radius);
  const qy = Math.abs(py) - (half - radius);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - radius;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function renderIcon(size, { rounded = true, glyphScale = 1, aa = 1.25 / size } = {}) {
  const png = new PNG({ width: size, height: size });
  const half = size / 2;
  const cornerRadius = rounded ? size * 0.2237 : 0; // iOS 圆角比例

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = x + 0.5 - half;
      const cy = y + 0.5 - half;
      const u = cx / size; // 0~1 中心化坐标
      const v = cy / size;

      // 渐变背景
      const t = clamp01((y + 0.5) / size);
      let r = TOP[0] + (BOTTOM[0] - TOP[0]) * t;
      let g = TOP[1] + (BOTTOM[1] - TOP[1]) * t;
      let b = TOP[2] + (BOTTOM[2] - TOP[2]) * t;
      let alpha = rounded ? clamp01(0.5 - roundedRectSDF(u, v, 0.5, cornerRadius) / aa) : 255;

      // 「¥」字形（maskable 时缩小以留出安全区）
      let glyph = 0;
      for (const [x1, y1, x2, y2] of SEGMENTS) {
        const d = segDist(u + 0.5, v + 0.5, x1, y1, x2, y2);
        glyph = Math.max(glyph, clamp01((HALF_STROKE * glyphScale - d) / aa));
      }
      r = r + (255 - r) * glyph;
      g = g + (255 - g) * glyph;
      b = b + (255 - b) * glyph;

      const idx = (size * y + x) << 2;
      png.data[idx] = Math.round(r);
      png.data[idx + 1] = Math.round(g);
      png.data[idx + 2] = Math.round(b);
      png.data[idx + 3] = Math.round(alpha);
    }
  }
  return png;
}

function writePng(name, png) {
  const file = path.join(outDir, name);
  fs.writeFileSync(file, PNG.sync.write(png));
  console.log(`✓ ${name} (${png.width}x${png.height})`);
}

// 常规图标（圆角 + 透明四角）
writePng('icon-192.png', renderIcon(192));
writePng('icon-512.png', renderIcon(512));
// maskable：全出血 + 字形缩小到 62% 安全区
writePng('icon-512-maskable.png', renderIcon(512, { rounded: false, glyphScale: 0.62 }));
// iOS 桌面图标（系统自动裁圆角）
writePng('apple-touch-icon.png', renderIcon(180, { rounded: false }));

console.log('图标已生成到 public/icons/');
