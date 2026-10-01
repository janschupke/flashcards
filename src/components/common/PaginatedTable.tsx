import React, { useId } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { TABLE_CONSTANTS } from '../../constants';

interface PaginatedTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  /** Accessible name for the table. Two different tables render through this. */
  caption: string;
  pageSize?: number;
  /**
   * Passed through to TanStack as table meta. Lets headers read live state
   * (such as the current sort) without the columns array changing identity.
   */
  meta?: Record<string, unknown>;
}

const PAGE_BUTTON_CLASS =
  'px-2 py-1 text-sm border border-border-primary rounded bg-surface-secondary text-text-primary ' +
  // enabled: so a disabled button does not light up as if it could be pressed.
  'disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-surface-hover ' +
  'focus:outline-none focus:ring-2 focus:ring-border-focus';

export function PaginatedTable<T>({
  data,
  columns,
  caption,
  pageSize = TABLE_CONSTANTS.DEFAULT_PAGE_SIZE,
  meta,
}: PaginatedTableProps<T>): React.ReactElement {
  const pageSizeId = useId();

  // TanStack Table's useReactTable is designed to return stable functions
  // The React Compiler warning is a false positive - this is the intended API usage
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table API is intentionally non-memoizable
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    ...(meta ? { meta } : {}),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border-primary">
          {/* Names the table for assistive tech without taking visual space. */}
          <caption className="sr-only">{caption}</caption>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border-primary">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-2 py-2 text-left text-xs font-semibold text-text-tertiary uppercase"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-border-secondary">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-2 py-2 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <label htmlFor={pageSizeId} className="text-sm text-text-secondary">
            Rows per page:
          </label>
          <select
            id={pageSizeId}
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="px-2 py-1 text-sm border border-border-primary rounded bg-transparent text-text-primary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-border-focus"
          >
            {TABLE_CONSTANTS.PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {/* Page position changes as you paginate, so announce it politely. */}
        <div className="flex items-center gap-2 text-sm text-text-secondary" aria-live="polite">
          <span>
            Page{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </strong>
          </span>
          <span className="text-text-tertiary" aria-hidden="true">
            |
          </span>
          <span>
            Showing {table.getRowModel().rows.length} of {data.length} entries
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
            className={PAGE_BUTTON_CLASS}
          >
            <span aria-hidden="true">{'<<'}</span>
          </button>
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
            className={PAGE_BUTTON_CLASS}
          >
            <span aria-hidden="true">{'<'}</span>
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
            className={PAGE_BUTTON_CLASS}
          >
            <span aria-hidden="true">{'>'}</span>
          </button>
          <button
            type="button"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
            className={PAGE_BUTTON_CLASS}
          >
            <span aria-hidden="true">{'>>'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
