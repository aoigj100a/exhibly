// next/image 允許的圖片來源網域，唯一真相來源。
// next.config.ts 的 remotePatterns 從這份清單產生；ExhibitionImage 用它
// 在渲染前判斷 src 的 hostname 有沒有在白名單內，沒有就退回展牌 fallback。
// 要開放新網域，改這裡就好，不要在 next.config.ts 另外加一份。
export const imageHosts = [
  "event.moc.gov.tw",
  "res.klook.com",
  "imgs2.utiki.com.tw",
] as const;
