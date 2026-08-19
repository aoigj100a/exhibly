import Image from "next/image";
import {
  getPlaqueBackground,
  PLAQUE_TEXT_COLOR,
  type PlaqueTag,
} from "@/lib/tagColor";
import { imageHosts } from "@/lib/imageHosts";

// next/image 遇到不在 remotePatterns 白名單內的 hostname 會在 server render
// 階段直接 throw（不是載入失敗，onError 接不到），一筆炸掉會讓整頁跟著 500。
// 所以要在把 src 交給 <Image> 之前，自己先判斷 hostname 在不在白名單內。
function getHostname(src: string): string | null {
  try {
    return new URL(src).hostname;
  } catch {
    return null;
  }
}

// 展覽圖片：有圖顯示圖、null 或空字串顯示「展牌」（主題色背景＋展覽名大字）。
// 三頁（詳情、篩選列表、首頁）共用這一個組件——要改占位樣式只改這裡一處。

export default function ExhibitionCover({
  src,
  alt,
  tags = [],
  className = "",
  sizes = "100vw",
}: {
  src: string | null;
  alt: string;
  tags?: PlaqueTag[];
  className?: string;
  sizes?: string;
}) {
  // src 可能是 null，也可能是空字串 ""，兩者都當作沒圖。
  // 用 trim() 一併擋掉只有空白的字串。
  const hasImage = typeof src === "string" && src.trim() !== "";

  const hostname = hasImage ? getHostname(src) : null;
  const isAllowedHost =
    hostname !== null && (imageHosts as readonly string[]).includes(hostname);

  if (hasImage && !isAllowedHost) {
    console.warn(
      `ExhibitionCover: 網域不在白名單，退回展牌 fallback — hostname=${hostname ?? "(不合法的 URL)"}, 展覽=${alt}`,
    );
  }

  if (!hasImage || !isAllowedHost) {
    // 展牌色：只看 MOOD 標籤（ADR-003），零 MOOD 中性灰、單 MOOD 純色、
    // 多 MOOD 線性漸層（拼色 vs 漸層在 /lab/colors 比較過，選漸層）。
    // 文字色固定用 PLAQUE_TEXT_COLOR，已針對全部 MOOD 色相驗過對比，
    // 不用再依背景動態算、疊遮罩。
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden p-4 text-center ${className}`}
        style={getPlaqueBackground(tags)}
      >
        {/* 圖片區在列表/詳情頁都是主視覺尺寸的容器了，字級跟著放大撐住份量 */}
        <span
          className="relative z-10 line-clamp-3 text-base leading-snug font-bold sm:text-xl"
          style={{ color: PLAQUE_TEXT_COLOR }}
        >
          {alt}
        </span>
      </div>
    );
  }

  return (
    // 外部圖沒有固定尺寸，用 fill 讓 next/image 依 className 給的容器撐開，
    // 同時保留 object-cover 不變形、避免 layout shift。
    // 容器背景先墊主題色（跟展牌用同一份取色），lazy load 圖片載完的空檔
    // 顯示的是主題色而不是破圖 icon，圖蓋上去後背景自然被蓋住，不需要
    // onLoad 之類的狀態去切換。
    <div
      className={`relative overflow-hidden ${className}`}
      style={getPlaqueBackground(tags)}
    >
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}