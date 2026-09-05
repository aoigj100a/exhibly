import { auth } from "@/auth";

// 回傳布林值的話呼叫端可能忘記檢查，忘記不會報錯、只會安靜地開一個洞，
// 所以不通過時直接 throw，逼呼叫端要嘛讓例外往外傳、要嘛顯式接住。
//
// 只用「有沒有 session」判斷：allowlist 已在 signIn callback 擋掉
// (auth.ts)，目前不存在「有 session 但不是本人」的狀態，不需要在這裡
// 重複比對 ADMIN_EMAIL。
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("未授權：需要登入才能執行此操作");
  }
}
