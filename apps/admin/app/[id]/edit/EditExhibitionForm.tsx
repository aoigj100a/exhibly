"use client";

import { useActionState } from "react";
import { Button } from "@exhibly/ui/components/button";
import { updateExhibition, type CreateExhibitionState } from "../../actions";

const inputClassName =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export default function EditExhibitionForm({
  exhibitionId,
  initialValues,
}: {
  exhibitionId: string;
  initialValues: CreateExhibitionState["values"];
}) {
  const initialState: CreateExhibitionState = {
    errors: {},
    values: initialValues,
  };
  const updateThisExhibition = updateExhibition.bind(null, exhibitionId);
  const [state, formAction] = useActionState(
    updateThisExhibition,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          展覽名稱
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

      <div className="space-y-1.5">
        <label htmlFor="startDate" className="text-sm font-medium">
          開始日期
        </label>
        <input
          id="startDate"
          name="startDate"
          type="date"
          required
          defaultValue={state.values.startDate}
          className={inputClassName}
        />
        <FieldError message={state.errors.startDate} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="endDate" className="text-sm font-medium">
          結束日期
        </label>
        <input
          id="endDate"
          name="endDate"
          type="date"
          defaultValue={state.values.endDate}
          className={inputClassName}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="city" className="text-sm font-medium">
          城市
        </label>
        <input
          id="city"
          name="city"
          type="text"
          defaultValue={state.values.city}
          className={inputClassName}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="venue" className="text-sm font-medium">
          場館
        </label>
        <input
          id="venue"
          name="venue"
          type="text"
          defaultValue={state.values.venue}
          className={inputClassName}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="location" className="text-sm font-medium">
          地址
        </label>
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={state.values.location}
          className={inputClassName}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="ticketUrl" className="text-sm font-medium">
          售票連結
        </label>
        <input
          id="ticketUrl"
          name="ticketUrl"
          type="text"
          defaultValue={state.values.ticketUrl}
          className={inputClassName}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="officialUrl" className="text-sm font-medium">
          官方網站
        </label>
        <input
          id="officialUrl"
          name="officialUrl"
          type="text"
          defaultValue={state.values.officialUrl}
          className={inputClassName}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="imageUrl" className="text-sm font-medium">
          圖片網址
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="text"
          defaultValue={state.values.imageUrl}
          className={inputClassName}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="isFree" className="text-sm font-medium">
          是否售票
        </label>
        <select
          id="isFree"
          name="isFree"
          defaultValue={state.values.isFree}
          className={inputClassName}
        >
          <option value="">未知</option>
          <option value="true">免費</option>
          <option value="false">收費</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="price" className="text-sm font-medium">
          票價說明
        </label>
        <input
          id="price"
          name="price"
          type="text"
          defaultValue={state.values.price}
          className={inputClassName}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="openingHours" className="text-sm font-medium">
          開放時段
        </label>
        <input
          id="openingHours"
          name="openingHours"
          type="text"
          defaultValue={state.values.openingHours}
          className={inputClassName}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium">
          簡介
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={state.values.description}
          className={inputClassName}
        />
      </div>

      <Button type="submit">儲存</Button>
    </form>
  );
}
