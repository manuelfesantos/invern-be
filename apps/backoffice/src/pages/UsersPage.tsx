import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { api } from "../lib/api";
import { DataTable } from "../components/data-table/DataTable";
import { Badge } from "../components/ui";

const PAGE_SIZE = 10;

async function fetchUsers(page: number) {
  const { data, error } = await api.GET("/private/users", {
    params: { query: { page, pageSize: PAGE_SIZE } },
  });
  if (error) throw error;
  return data.data;
}

type UserRow = NonNullable<Awaited<ReturnType<typeof fetchUsers>>>["data"][number];

const columns: ColumnDef<UserRow, unknown>[] = [
  { header: "Email", accessorKey: "email" },
  {
    header: "Name",
    cell: ({ row }) =>
      `${row.original.firstName ?? ""} ${row.original.lastName ?? ""}`.trim() ||
      "—",
  },
  {
    header: "Validated",
    cell: ({ row }) =>
      row.original.isValidated ? (
        <Badge variant="success">Yes</Badge>
      ) : (
        <Badge variant="warning">No</Badge>
      ),
  },
];

export function UsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["users", page],
    queryFn: () => fetchUsers(page),
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Users</h1>
      <p className="mb-4 text-sm text-slate-500">
        A read-only demo of the shared DataTable (server-side pagination).
      </p>
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
        emptyMessage="No users"
      />
    </div>
  );
}
