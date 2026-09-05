import { auth } from "@/auth";

export default async function GuestBanner() {
  const session = await auth();
  if (session?.user) return null;

  return (
    <div className="border-b border-border bg-muted px-6 py-2 text-sm text-muted-foreground sm:px-8">
      訪客模式：可以瀏覽與填寫表單，但送出會失敗，需要登入才能寫入資料。
    </div>
  );
}
