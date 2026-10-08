import { useCallback, useEffect, useMemo, useState } from "react";

const selectAll = () => true;

/**
 * Checkbox selection for the rows on the current table page. Only rows passing
 * `isSelectable` can be selected, and ids that leave the page or stop being
 * selectable (e.g. after a refetch) are dropped automatically.
 *
 * `getId` and `isSelectable` should be stable (module-level) functions.
 */
export function useRowSelection<T>(
  rows: T[] | undefined,
  getId: (row: T) => string,
  isSelectable: (row: T) => boolean = selectAll,
) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectableIds = useMemo(
    () => (rows ?? []).filter(isSelectable).map(getId),
    [rows, getId, isSelectable],
  );

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = prev.filter((id) => selectableIds.includes(id));
      return next.length === prev.length ? prev : next;
    });
  }, [selectableIds]);

  const selectedRows = useMemo(
    () => (rows ?? []).filter((row) => selectedIds.includes(getId(row))),
    [rows, getId, selectedIds],
  );

  /** Ids of the selected rows matching `predicate`, e.g. the ones a bulk action applies to. */
  const selectedIdsWhere = useCallback(
    (predicate: (row: T) => boolean) => selectedRows.filter(predicate).map(getId),
    [selectedRows, getId],
  );

  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);

  const toggle = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (!checked) return prev.filter((selectedId) => selectedId !== id);
      return prev.includes(id) ? prev : [...prev, id];
    });
  }, []);

  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));

  const toggleAll = useCallback(
    (checked: boolean) => setSelectedIds(checked ? selectableIds : []),
    [selectableIds],
  );

  const clear = useCallback(() => setSelectedIds([]), []);

  return {
    selectedIds,
    selectableIds,
    selectedIdsWhere,
    isSelected,
    toggle,
    allSelected,
    toggleAll,
    clear,
  };
}
