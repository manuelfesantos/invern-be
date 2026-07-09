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
import { CollectionForm } from "./CollectionForm";

const PAGE_SIZE = 10;

async function fetchCollections(page: number) {
  const { data, error } = await api.GET("/private/collections", {
    params: { query: { page, pageSize: PAGE_SIZE } },
  });
  if (error) throw error;
  return data.data;
}
type Row = NonNullable<
  Awaited<ReturnType<typeof fetchCollections>>
>["data"][number];

export function CollectionsPage() {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["collections", page],
    queryFn: () => fetchCollections(page),
    placeholderData: keepPreviousData,
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE("/private/collections/{id}", {
        params: { path: { id } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Collection deleted");
      void qc.invalidateQueries({ queryKey: ["collections"] });
      setDeleting(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  const columns: ColumnDef<Row, unknown>[] = [
    { header: "Name", accessorKey: "name" },
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
        <h1 className="text-xl font-bold text-slate-900">Collections</h1>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormOpen(true);
          }}
        >
          New collection
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
        emptyMessage="No collections yet"
      />
      <CollectionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingId={editingId}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete collection?"
        description={`This permanently removes "${deleting?.name}".`}
        confirmLabel="Delete"
        onConfirm={() => deleting?.id && del.mutate(deleting.id)}
        isPending={del.isPending}
      />
    </div>
  );
}
