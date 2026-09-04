const CATEGORY_LABEL: Record<string, string> = {
  SUBJECT: "題材",
  MOOD: "氛圍",
};

// 分組顯示、複選、勾選狀態：新增展覽表單跟 /[id]/tags 共用同一份。
// 不依賴任何「已存在的展覽」——只要給 tags 清單跟目前選中的 id 集合
// 就能畫出來，新增時傳空集合即可。
export default function TagCheckboxGroups({
  tags,
  selectedTagIds,
  fieldName = "tagIds",
}: {
  tags: { id: string; name: string; category: string }[];
  selectedTagIds: Set<string>;
  fieldName?: string;
}) {
  const groups = new Map<string, typeof tags>();
  for (const tag of tags) {
    const group = groups.get(tag.category) ?? [];
    group.push(tag);
    groups.set(tag.category, group);
  }

  return (
    <>
      {[...groups.entries()].map(([category, groupTags]) => (
        <fieldset key={category} className="space-y-3">
          <legend className="text-sm font-medium">
            {CATEGORY_LABEL[category] ?? category}
          </legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {groupTags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  name={fieldName}
                  value={tag.id}
                  defaultChecked={selectedTagIds.has(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </>
  );
}
