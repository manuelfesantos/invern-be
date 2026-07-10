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
import {
  Button,
  ConfirmDialog,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from "../../components/ui";
import { TaxForm } from "./TaxForm";

const PAGE_SIZE = 10;
const ALL = "__all__";

async function fetchTaxes(page: number, countryCode: string) {
  const { data, error } = await api.GET("/private/taxes", {
    params: {
      query: {
        page,
        pageSize: PAGE_SIZE,
        ...(countryCode ? { countryCode } : {}),
      },
    },
  });
  if (error) throw error;
  return data.data;
}
type Row = NonNullable<Awaited<ReturnType<typeof fetchTaxes>>>["data"][number];

async function fetchCountries() {
  const { data, error } = await api.GET("/private/countries", {
    params: { query: { page: 1, pageSize: 100 } },
  });
  if (error) throw error;
  return data.data?.data ?? [];
}

const percent = (rate: number | undefined) =>
  `${+((rate ?? 0) * 100).toFixed(4)}%`;

export function TaxesPage() {
  const [page, setPage] = useState(1);
  const [country, setCountry] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const qc = useQueryClient();

  const { data: countries } = useQuery({
    queryKey: ["countries", "all"],
    queryFn: fetchCountries,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["taxes", page, country],
    queryFn: () => fetchTaxes(page, country),
    placeholderData: keepPreviousData,
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE("/private/taxes/{id}", {
        params: { path: { id } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tax deleted");
      void qc.invalidateQueries({ queryKey: ["taxes"] });
      void qc.invalidateQueries({ queryKey: ["countries"] });
      setDeleting(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  const columns: ColumnDef<Row, unknown>[] = [
    { header: "Name", accessorKey: "name" },
    {
      header: "Country",
      cell: ({ row }) => (
        <span className="font-mono">{row.original.countryCode}</span>
      ),
    },
    { header: "Rate", cell: ({ row }) => percent(row.original.rate) },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditing(row.original);
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
        <h1 className="text-xl font-bold text-slate-900">Taxes</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          New tax
        </Button>
      </div>
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <Label className="text-slate-500">Country</Label>
        <Select
          value={country || ALL}
          onValueChange={(v) => {
            setCountry(v === ALL ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All countries</SelectItem>
            {countries?.map((c) => (
              <SelectItem key={c.code} value={c.code ?? ""}>
                {c.code} — {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        emptyMessage="No taxes"
      />
      <TaxForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={
          editing
            ? {
                id: editing.id ?? "",
                name: editing.name ?? "",
                rate: editing.rate ?? 0,
                countryCode: editing.countryCode ?? "",
              }
            : null
        }
        defaultCountry={country || undefined}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete tax ${deleting?.name}?`}
        description={`This removes the ${percent(deleting?.rate)} rate for ${
          deleting?.countryCode
        }. Future orders for that country use its remaining taxes (none = untaxed); past orders are unaffected.`}
        confirmLabel="Delete"
        onConfirm={() => deleting?.id && del.mutate(deleting.id)}
        isPending={del.isPending}
      />
    </div>
  );
}
