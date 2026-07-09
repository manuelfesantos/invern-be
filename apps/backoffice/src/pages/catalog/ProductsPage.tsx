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
import { Badge, Button, Checkbox, ConfirmDialog, Input, toast } from "../../components/ui";
import { formatPrice } from "../../lib/format";
import { ProductForm } from "./ProductForm";

const PAGE_SIZE = 10;
const LOW_STOCK = 5;

async function fetchProducts(page: number, name: string, lowStock: boolean) {
  const { data, error } = await api.GET("/private/products", {
    params: {
      query: {
        page,
        pageSize: PAGE_SIZE,
        ...(name ? { name } : {}),
        ...(lowStock ? { maxStock: LOW_STOCK } : {}),
      },
    },
  });
  if (error) throw error;
  return data.data;
}
type Row = NonNullable<
  Awaited<ReturnType<typeof fetchProducts>>
>["data"][number];

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", page, name, lowStock],
    queryFn: () => fetchProducts(page, name, lowStock),
    placeholderData: keepPreviousData,
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE("/private/products/{id}", {
        params: { path: { id } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product deleted");
      void qc.invalidateQueries({ queryKey: ["products"] });
      setDeleting(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  const columns: ColumnDef<Row, unknown>[] = [
    { header: "Name", accessorKey: "name" },
    {
      header: "Price",
      cell: ({ row }) => formatPrice(row.original.priceInCents ?? 0),
    },
    {
      header: "Stock",
      cell: ({ row }) =>
        (row.original.stock ?? 0) <= LOW_STOCK ? (
          <Badge variant="warning">{(row.original.stock ?? 0)}</Badge>
        ) : (
          (row.original.stock ?? 0)
        ),
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
              setEditingId(row.original.id ?? null);
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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Products</h1>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormOpen(true);
          }}
        >
          New product
        </Button>
      </div>
      <div className="mb-3 flex items-center gap-4">
        <Input
          placeholder="Search by name…"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <Checkbox
            checked={lowStock}
            onCheckedChange={(v) => {
              setLowStock(v === true);
              setPage(1);
            }}
          />
          Low stock only
        </label>
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
        emptyMessage="No products found"
      />
      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingId={editingId}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete product?"
        description={`This permanently removes "${deleting?.name}".`}
        confirmLabel="Delete"
        onConfirm={() => deleting?.id && del.mutate(deleting.id)}
        isPending={del.isPending}
      />
    </div>
  );
}
