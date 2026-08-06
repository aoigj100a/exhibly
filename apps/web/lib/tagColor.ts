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
