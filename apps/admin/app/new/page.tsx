import { Button } from "@exhibly/ui/components/button";
import { createExhibition } from "../actions";

export default function NewExhibitionPage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-12 sm:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">新增展覽</h1>
      </header>

      <form action={createExhibition} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            展覽名稱
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="startDate" className="text-sm font-medium">
            開始日期
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <Button type="submit">送出</Button>
      </form>
    </main>
  );
}
