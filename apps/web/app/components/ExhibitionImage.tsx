import Image from "next/image";
import { tagToHsl, NEUTRAL_PLAQUE_COLOR } from "@/lib/tagColor";

// 展覽圖片：有圖顯示圖、null 或空字串顯示「展牌」（主題色背景＋展覽名大字）。
// 三頁（詳情、篩選列表、首頁）共用這一個組件——要改占位樣式只改這裡一處。

export default function ExhibitionImage({
  src,
  alt,
  tags = [],
  className = "",
  sizes = "100vw",
}: {
  src: string | null;
  alt: string;
  tags?: string[];
  className?: string;
  sizes?: string;
}) {
  // src 可能是 null，也可能是空字串 ""，兩者都當作沒圖。
  // 用 trim() 一併擋掉只有空白的字串。
  const hasImage = typeof src === "string" && src.trim() !== "";

  if (!hasImage) {
    // 展牌色取自第一個標籤；目前只做單標籤版本，多標籤漸層留到下一步。
    // 完全沒標籤（理論上可能）則退回中性灰，不讓畫面開天窗。
    const plaqueColor = tags[0] ? tagToHsl(tags[0]) : NEUTRAL_PLAQUE_COLOR;

    return (
      <div
        className={`flex items-center justify-center overflow-hidden p-3 text-center ${className}`}
        style={{ backgroundColor: plaqueColor }}
      >
        <span className="line-clamp-3 text-sm leading-snug font-bold text-gray-800 sm:text-base">
          {alt}
        </span>
      </div>
    );
  }

  return (
    // 外部圖沒有固定尺寸，用 fill 讓 next/image 依 className 給的容器撐開，
    // 同時保留 object-cover 不變形、避免 layout shift。
    <div className={`relative overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}