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
import { CountryForm } from "./CountryForm";

const PAGE_SIZE = 10;

async function fetchCountries(page: number) {
  const { data, error } = await api.GET("/private/countries", {
    params: { query: { page, pageSize: PAGE_SIZE } },
  });
  if (error) throw error;
  return data.data;
}
type Row = NonNullable<
  Awaited<ReturnType<typeof fetchCountries>>
>["data"][number];

export function CountriesPage() {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["countries", page],
    queryFn: () => fetchCountries(page),
    placeholderData: keepPreviousData,
  });

  const del = useMutation({
    mutationFn: async (code: string) => {
      const { error } = await api.DELETE("/private/countries/{code}", {
        params: { path: { code } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Country deleted");
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
    { header: "Locale", accessorKey: "locale" },
    {
      header: "Currency",
      cell: ({ row }) => row.original.currency?.code ?? "—",
    },
    {
      header: "Taxes",
      cell: ({ row }) => row.original.taxes?.length ?? 0,
    },
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

  const taxCount = deleting?.taxes?.length ?? 0;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Countries</h1>
        <Button
          onClick={() => {
            setEditingCode(null);
            setFormOpen(true);
          }}
        >
          New country
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
        emptyMessage="No countries yet"
      />
      <CountryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingCode={editingCode}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete country ${deleting?.code}?`}
        description={`This also deletes its ${taxCount} tax rate${
          taxCount === 1 ? "" : "s"
        } and any shipping coverage for this country. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => deleting?.code && del.mutate(deleting.code)}
        isPending={del.isPending}
      />
    </div>
  );
}
