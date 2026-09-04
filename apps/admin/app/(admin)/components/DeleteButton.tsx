"use client";

import { Button } from "@exhibly/ui/components/button";
import { deleteExhibition } from "../actions";

export default function DeleteButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  return (
    <form
      action={deleteExhibition}
      onSubmit={(event) => {
        if (!window.confirm(`確定要刪除「${name}」嗎？此動作無法復原`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="outline" size="sm">
        刪除
      </Button>
    </form>
  );
}
