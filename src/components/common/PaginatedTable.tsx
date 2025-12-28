import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';

interface PaginatedTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
}

export function PaginatedTable<T>({
  data,
  columns,
  pageSize = 10,
}: PaginatedTableProps<T>): React.ReactElement {
  // TanStack Table's useReactTable is designed to return stable functions
  // The React Compiler warning is a false positive - this is the intended API usage
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table API is intentionally non-memoizable
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border-primary">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
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
          <button
            type="button"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 text-sm border border-border-primary rounded bg-surface-secondary text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-tertiary"
          >
            {'<<'}
          </button>
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 text-sm border border-border-primary rounded bg-surface-secondary text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-tertiary"
          >
            {'<'}
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 text-sm border border-border-primary rounded bg-surface-secondary text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-tertiary"
          >
            {'>'}
          </button>
          <button
            type="button"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 text-sm border border-border-primary rounded bg-surface-secondary text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-tertiary"
          >
            {'>>'}
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span>
            Page{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </strong>
          </span>
          <span className="text-text-tertiary">|</span>
          <span>
            Showing {table.getRowModel().rows.length} of {data.length} entries
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">Rows per page:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="px-2 py-1 text-sm border border-border-primary rounded bg-surface-secondary text-text-primary"
          >
            {[10, 20, 30, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
