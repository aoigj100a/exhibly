import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="mx-auto flex max-w-sm flex-col items-center gap-4 px-6 py-24">
      <h1 className="text-xl font-bold">Exhibly Admin</h1>
      <form
        action={async () => {
          "use server";
          await signIn("github");
        }}
      >
        <button
          type="submit"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium"
        >
          使用 GitHub 登入
        </button>
      </form>
    </main>
  );
}
