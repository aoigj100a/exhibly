// 本機是 UTC+8、Vercel 是 UTC，用 getFullYear() 那類本地時間方法在兩邊
// 會讀出不同的年月日。全程只用 getUTC* 系列：先把時間加 8 小時「平移」到
// 台灣時間所在的數值，再用 getUTC* 讀出年月日，兩邊執行環境結果才會一致。
export function taipeiToday(): Date {
  const shifted = new Date(Date.now() + 8 * 60 * 60 * 1000);
  return new Date(
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
    ),
  );
}
