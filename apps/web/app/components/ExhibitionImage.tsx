// 展覽圖片：有圖顯示圖、null 或空字串顯示占位，卡片不開天窗。
// 三頁（詳情、篩選列表、首頁）共用這一個組件——要改占位樣式只改這裡一處。

export default function ExhibitionImage({
  src,
  alt,
  className = "",
}: {
  src: string | null;
  alt: string;
  className?: string;
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
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`object-cover ${className}`} />
  );
}