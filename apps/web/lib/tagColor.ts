import type { CSSProperties } from "react";

// 標籤 → 莫蘭迪色。H 由標籤名雜湊決定、S/L 鎖死，
// 數值來自 /lab/colors 色彩實驗室肉眼比較後選定的版本。
const SATURATION = 25;
const LIGHTNESS = 82;

// 沒有標籤可用時的中性展牌色：同一組 L，S 歸零維持同一套灰階家族。
export const NEUTRAL_PLAQUE_COLOR = `hsl(0, 0%, ${LIGHTNESS}%)`;

// ADR-003：展牌取色只看氛圍(MOOD)，題材(SUBJECT)不參與配色。呼叫端只需要
// name/category 這兩個欄位，用最小形狀而不是整個 Tag model，方便從任何帶
// 分類的標籤資料（Prisma Tag、或其他來源）直接傳進來。
export interface PlaqueTag {
  name: string;
  category: string;
}

// ADR-003 定案：展牌大字固定用這個深色，不再依背景亮度動態算/疊遮罩。
// 數值來自 /lab/tags 區塊 B 的三個候選（全 MOOD 色相皆 ≥ 4.5:1）裡選定的
// 品牌橙深色版，比純灰多一點品牌調性。
export const PLAQUE_TEXT_COLOR = "hsl(15, 70%, 25%)";

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

// 展牌背景：只看 MOOD 標籤取色，題材(SUBJECT)不參與——ADR-003 定案。
// 零 MOOD（只掛題材，或完全沒標籤）落到中性灰 fallback；單一 MOOD 純色；
// 多個 MOOD 維持線性漸層（135 度、色相依序排開，ADR-002 定案，拼色版本
// 比較後被否決）。文字色已經固定（見 PLAQUE_TEXT_COLOR），不再需要動態
// 算對比、疊遮罩，所以連帶拿掉了原本的 WCAG 檢查函式。
export function getPlaqueBackground(tags: PlaqueTag[]): CSSProperties {
  const moodNames = tags
    .filter((t) => t.category === "MOOD")
    .map((t) => t.name);

  if (moodNames.length === 0) {
    return { backgroundColor: NEUTRAL_PLAQUE_COLOR };
  }
  if (moodNames.length === 1) {
    return { backgroundColor: tagToHsl(moodNames[0]!) };
  }
  const stops = moodNames.map((name, i) => {
    const pos = (i / (moodNames.length - 1)) * 100;
    return `${tagToHsl(name)} ${pos}%`;
  });
  return { backgroundImage: `linear-gradient(135deg, ${stops.join(", ")})` };
}
