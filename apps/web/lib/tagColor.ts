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
// 保證同一個標籤字串永遠對應同一個色相。ADR-004 手工表定案後，這個函式
// 退居 fallback：新增或改名 MOOD 詞、還沒補進 MOOD_HUE_MAP 之前，靠它
// 撐著不要整個掉回中性灰或撞色到看不出來。
export function hashTagToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

// ADR-004 定案：MOOD 色相改手工指定，不再讓雜湊決定。原因是十個雜湊值
// 裡有四個擠在綠帶（約 85–150 度）附近，人眼在這段的色相解析度最差，
// 擠在一起等於看起來全部一樣；而藍紫段反而大片空著。
//
// 分配邏輯不是把 360 度平均切十份：
// - 綠帶（85–150）人眼解析度最差，整段只留一個名額給「親子」，
//   前後刻意留大間距（絢爛→親子 55 度、親子→好拍 48 度）隔開鄰居；
// - 藍紫段（好拍→…→可愛）辨識度中等，五個詞等距排開，每個間隔 34 度；
// - 紅粉褐段（可愛→震撼→懷舊→絢爛，跨 0 度）人眼辨識度最高，可以排
//   最密，間隔壓到 27～30 度。
//
// 只收 MOOD：SUBJECT 不吃色（ADR-003），這張表沒有、也不該有 SUBJECT 的詞。
const MOOD_HUE_MAP: Record<string, number> = {
  懷舊: 25,
  絢爛: 55,
  親子: 110,
  好拍: 158,
  知性: 192,
  沉浸式: 226,
  詭譎: 260,
  奇幻: 294,
  可愛: 328,
  震撼: 355,
};

// 查表查不到（新詞、改名、或誤傳 SUBJECT 名稱進來）就落回 hashTagToHue，
// 並在 dev 環境印一行 WARN——症狀從「安靜地撞色」變成「顏色怪 + 一行提醒」，
// 才不會在正式環境也吵，也不會讓人以為是刻意設計成雜湊色。
function resolveMoodHue(name: string): number {
  const hue = MOOD_HUE_MAP[name];
  if (hue !== undefined) return hue;

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[tagColor] MOOD 標籤「${name}」不在 MOOD_HUE_MAP，落回 hashTagToHue`,
    );
  }
  return hashTagToHue(name);
}

export function tagToHsl(name: string): string {
  const hue = resolveMoodHue(name);
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
