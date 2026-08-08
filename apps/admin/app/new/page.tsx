import NewExhibitionForm from "./NewExhibitionForm";

export default function NewExhibitionPage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-12 sm:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">新增展覽</h1>
      </header>

      <NewExhibitionForm />
    </main>
  );
}
