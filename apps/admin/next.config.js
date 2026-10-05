/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // 圖片上傳走 Server Action，檔案大小依序會碰到三道關卡：
      //   1. 這裡（Next.js Server Action body 上限）4 MB
      //   2. Vercel 平台的 request body 上限，約 4.5 MB
      //   3. Supabase bucket 的檔案大小限制 5 MB
      // 故意設 4 MB 而不是 5 MB：讓 Next 這層成為最先擋下來的那道，
      // 之後要給「檔案太大」掛上講人話的錯誤訊息時，才有一個我們自己
      // 控制得到的地方可以掛；若設得比後面兩道寬，超大的檔案會先在
      // Vercel 或 bucket 那邊失敗，錯誤長什麼樣子就不歸我們管了。
      // 預設是 1 MB，不調的話一般照片在進 action 之前就會失敗。
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
