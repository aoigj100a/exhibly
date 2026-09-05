import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function AccountBar() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex items-center justify-end gap-3 border-b border-border px-6 py-2 text-sm text-muted-foreground sm:px-8">
        <span>訪客模式（唯讀）</span>
        <Link href="/login" className="underline">
          登入
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-3 border-b border-border px-6 py-2 text-sm text-muted-foreground sm:px-8">
      <span>{session.user.email}</span>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button type="submit" className="underline">
          登出
        </button>
      </form>
    </div>
  );
}
