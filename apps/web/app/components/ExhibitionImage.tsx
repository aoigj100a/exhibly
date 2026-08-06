import Image from "next/image";
import { getPlaqueBackground, needsContrastOverlay } from "@/lib/tagColor";

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
    // 展牌色：無標籤中性灰、單標籤純色、多標籤線性漸層（跨標籤=跨類，
    // 漸層 vs 拼色在 /lab/colors 比較過，拼色的硬邊在莫蘭迪低彩度下太生硬，選漸層）。
    const showOverlay = needsContrastOverlay(tags);

    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden p-3 text-center ${className}`}
        style={getPlaqueBackground(tags)}
      >
        {/* 對比不足時疊極淡遮罩，不動字色邏輯本身 */}
        {showOverlay && <div className="absolute inset-0 bg-white/40" />}
        <span className="relative z-10 line-clamp-3 text-sm leading-snug font-bold text-gray-800 sm:text-base">
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