import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { api } from "../../lib/api";
import { DataTable } from "../../components/data-table/DataTable";
import { Button, ConfirmDialog, toast } from "../../components/ui";
import { CurrencyForm } from "./CurrencyForm";

const PAGE_SIZE = 10;

async function fetchCurrencies(page: number) {
  const { data, error } = await api.GET("/private/currencies", {
    params: { query: { page, pageSize: PAGE_SIZE } },
  });
  if (error) throw error;
  return data.data;
}
type Row = NonNullable<
  Awaited<ReturnType<typeof fetchCurrencies>>
>["data"][number];

export function CurrenciesPage() {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["currencies", page],
    queryFn: () => fetchCurrencies(page),
    placeholderData: keepPreviousData,
  });

  const del = useMutation({
    mutationFn: async (code: string) => {
      const { error } = await api.DELETE("/private/currencies/{code}", {
        params: { path: { code } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Currency deleted");
      void qc.invalidateQueries({ queryKey: ["currencies"] });
      void qc.invalidateQueries({ queryKey: ["countries"] });
      setDeleting(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  const columns: ColumnDef<Row, unknown>[] = [
    {
      header: "Code",
      cell: ({ row }) => (
        <span className="font-mono">{row.original.code}</span>
      ),
    },
    { header: "Name", accessorKey: "name" },
    { header: "Symbol", accessorKey: "symbol" },
    { header: "Rate to EUR", accessorKey: "rateToEuro" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditingCode(row.original.code ?? null);
              setFormOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleting(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Currencies</h1>
        <Button
          onClick={() => {
            setEditingCode(null);
            setFormOpen(true);
          }}
        >
          New currency
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        emptyMessage="No currencies yet"
      />
      <CurrencyForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingCode={editingCode}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete currency ${deleting?.code}?`}
        description="This also deletes every country using this currency — and those countries' taxes and shipping coverage. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => deleting?.code && del.mutate(deleting.code)}
        isPending={del.isPending}
      />
    </div>
  );
}
