import type { CSSProperties } from "react";

// 標籤 → 莫蘭迪色。H 由標籤名雜湊決定、S/L 鎖死，
// 數值來自 /lab/colors 色彩實驗室肉眼比較後選定的版本。
const SATURATION = 25;
const LIGHTNESS = 82;

// 沒有標籤可用時的中性展牌色：同一組 L，S 歸零維持同一套灰階家族。
export const NEUTRAL_PLAQUE_COLOR = `hsl(0, 0%, ${LIGHTNESS}%)`;

// 31 進位字串雜湊（同 Java String.hashCode() 算法），
// 保證同一個標籤字串永遠對應同一個色相。
export function hashTagToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

export function tagToHsl(name: string): string {
  const hue = hashTagToHue(name);
  return `hsl(${hue}, ${SATURATION}%, ${LIGHTNESS}%)`;
}

// 展牌背景：無標籤用中性灰、單標籤純色、多標籤線性漸層。
// 漸層方向（135 度、色相依序排開）是 /lab/colors 比較漸層 vs 拼色後選定的版本，
// 拼色（硬邊）版本比較後被否決，不進正式碼路徑。
export function getPlaqueBackground(tagNames: string[]): CSSProperties {
  if (tagNames.length === 0) {
    return { backgroundColor: NEUTRAL_PLAQUE_COLOR };
  }
  if (tagNames.length === 1) {
    return { backgroundColor: tagToHsl(tagNames[0]!) };
  }
  const stops = tagNames.map((name, i) => {
    const pos = (i / (tagNames.length - 1)) * 100;
    return `${tagToHsl(name)} ${pos}%`;
  });
  return { backgroundImage: `linear-gradient(135deg, ${stops.join(", ")})` };
}

// --- WCAG 對比檢查 ---
// 展牌固定用 text-gray-800（#1f2937）當文字色，這裡只檢查背景色夠不夠深讓
// 深色字撐住對比；對比不足時由呼叫端疊一層極淡遮罩，不動字色邏輯本身。
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

const TEXT_LUMINANCE = relativeLuminance([31, 41, 55]); // text-gray-800 (#1f2937)

// 展牌背景（含漸層的每一段）裡，只要有一個色相讓深色字對比掉到 4.5:1 以下，
// 就回傳 true，呼叫端據此決定要不要疊遮罩。
export function needsContrastOverlay(tagNames: string[]): boolean {
  const colors: Array<[hue: number, saturation: number]> =
    tagNames.length > 0
      ? tagNames.map((name) => [hashTagToHue(name), SATURATION])
      : [[0, 0]];

  return colors.some(([hue, saturation]) => {
    const rgb = hslToRgb(hue, saturation, LIGHTNESS);
    return contrastRatio(relativeLuminance(rgb), TEXT_LUMINANCE) < 4.5;
  });
}
