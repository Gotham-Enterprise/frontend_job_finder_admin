/**
 * Reusable layout and typography tokens for dense admin data tables.
 * Compose with column-specific classes (nowrap, text-right, etc.).
 */
export const dataTableTableClass =
  'w-full table-fixed border-collapse text-sm text-gray-900 dark:text-gray-100';

export const dataTableScrollWrapClass =
  'overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700';

export const dataTableHeaderRowClass =
  'border-b border-gray-200 bg-gray-50/95 dark:border-gray-700 dark:bg-gray-800/80';

export const dataTableHeaderCellClass =
  'px-5 py-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 first:pl-6 last:pr-6';

export const dataTableBodyRowClass =
  'border-b border-gray-100 transition-colors hover:bg-gray-50/90 dark:border-gray-800 dark:hover:bg-gray-800/40';

export const dataTableCellClass =
  'px-5 py-4 align-middle text-sm text-gray-800 dark:text-gray-200 first:pl-6 last:pr-6';

/** Use on an inner wrapper so long text truncates inside fixed table columns */
export const dataTableTruncatedTextClass =
  'block min-w-0 max-w-full truncate';
