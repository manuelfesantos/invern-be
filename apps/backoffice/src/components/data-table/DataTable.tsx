import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Button } from "../ui/button";
import { EmptyState, ErrorState, LoadingState } from "../ui/states";

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  /** Server-side pagination bound to the backend `{ data, page, pageSize, total }`. */
  total: number;
  page: number; // 1-based
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyMessage?: string;
  /** When set, rows are clickable (cursor + hover) and call this on click. */
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  total,
  page,
  pageSize,
  onPageChange,
  isLoading,
  isError,
  onRetry,
  emptyMessage,
  onRowClick,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  });

  if (isError) return <ErrorState onRetry={onRetry} />;
  if (isLoading && data.length === 0) return <LoadingState />;
  if (!isLoading && data.length === 0) {
    return <EmptyState title={emptyMessage ?? "No results"} />;
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="whitespace-nowrap px-4 py-2 font-medium"
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={
                  onRowClick ? () => onRowClick(row.original) : undefined
                }
                className={`hover:bg-slate-50 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="whitespace-nowrap px-4 py-2 text-slate-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-2 text-sm text-slate-500">
        <span>
          {total === 0 ? "0" : `${from}–${to}`} of {total}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <span>
            Page {page} of {lastPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= lastPage || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
