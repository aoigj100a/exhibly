"use client";

import { useActionState } from "react";
import { Button } from "@exhibly/ui/components/button";
import { createTag, type CreateTagState } from "../actions";

const initialState: CreateTagState = {
  errors: {},
  values: { name: "", category: "" },
};

const inputClassName =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export default function NewTagForm() {
  const [state, formAction] = useActionState(createTag, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-4"
    >
      <div className="w-48 space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          標籤名稱
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={state.values.name}
          className={inputClassName}
        />
        <FieldError message={state.errors.name} />
      </div>

      <div className="w-32 space-y-1.5">
        <label htmlFor="category" className="text-sm font-medium">
          分類
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={state.values.category}
          className={inputClassName}
        >
          <option value="">請選擇</option>
          <option value="SUBJECT">題材</option>
          <option value="MOOD">氛圍</option>
        </select>
        <FieldError message={state.errors.category} />
      </div>

      <Button type="submit">新增標籤</Button>
    </form>
  );
}
