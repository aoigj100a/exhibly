import Image from "next/image";

// 展覽圖片：有圖顯示圖、null 或空字串顯示占位，卡片不開天窗。
// 三頁（詳情、篩選列表、首頁）共用這一個組件——要改占位樣式只改這裡一處。

export default function ExhibitionImage({
  src,
  alt,
  className = "",
  sizes = "100vw",
}: {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  // src 可能是 null，也可能是空字串 ""，兩者都當作沒圖。
  // 用 trim() 一併擋掉只有空白的字串。
  const hasImage = typeof src === "string" && src.trim() !== "";

  if (!hasImage) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-sm text-muted-foreground ${className}`}
      >
        尚無圖片
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