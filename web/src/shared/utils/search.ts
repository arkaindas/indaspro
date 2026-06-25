export function fuzzyFilter<T>(
  items: T[],
  query: string,
  getSearchFields: (item: T) => string[]
): T[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase().trim();
  return items.filter((item) =>
    getSearchFields(item).some((field) => field.toLowerCase().includes(q))
  );
}
