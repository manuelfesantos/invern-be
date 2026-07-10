import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { api } from "../lib/api";
import { DataTable } from "../components/data-table/DataTable";
import {
  Badge,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui";
import { formatDate } from "../lib/format";

const PAGE_SIZE = 10;
const ANY = "__any__";

async function fetchUsers(
  page: number,
  email: string,
  role: string,
  validated: string,
) {
  const { data, error } = await api.GET("/private/users", {
    params: {
      query: {
        page,
        pageSize: PAGE_SIZE,
        sortBy: "createdAt",
        sortOrder: "desc",
        ...(email ? { email } : {}),
        ...(role ? { role: role as "ADMIN" | "USER" } : {}),
        ...(validated ? { isValidated: validated === "yes" } : {}),
      },
    },
  });
  if (error) throw error;
  return data.data;
}
type Row = NonNullable<Awaited<ReturnType<typeof fetchUsers>>>["data"][number];

const columns: ColumnDef<Row, unknown>[] = [
  { header: "Email", accessorKey: "email" },
  {
    header: "Name",
    cell: ({ row }) =>
      `${row.original.firstName ?? ""} ${row.original.lastName ?? ""}`.trim() ||
      "—",
  },
  {
    header: "Role",
    cell: ({ row }) =>
      row.original.role === "ADMIN" ? (
        <Badge>ADMIN</Badge>
      ) : (
        <span className="text-slate-500">USER</span>
      ),
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
  {
    header: "Status",
    cell: ({ row }) =>
      row.original.disabled ? (
        <Badge variant="danger">Disabled</Badge>
      ) : (
        <span className="text-slate-400">—</span>
      ),
  },
  {
    header: "Created",
    cell: ({ row }) =>
      row.original.createdAt ? formatDate(row.original.createdAt) : "—",
  },
];

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [validated, setValidated] = useState("");
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["users", page, email, role, validated],
    queryFn: () => fetchUsers(page, email, role, validated),
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Users</h1>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="space-y-1">
          <Label htmlFor="user-email">Email</Label>
          <Input
            id="user-email"
            placeholder="Search by email…"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-64"
          />
        </div>
        <div className="space-y-1">
          <Label>Role</Label>
          <Select
            value={role || ANY}
            onValueChange={(v) => {
              setRole(v === ANY ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any role</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="USER">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Validated</Label>
          <Select
            value={validated || ANY}
            onValueChange={(v) => {
              setValidated(v === ANY ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any</SelectItem>
              <SelectItem value="yes">Validated</SelectItem>
              <SelectItem value="no">Not validated</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
        emptyMessage="No users"
        onRowClick={(u) => navigate(`/users/${u.id}`)}
      />
    </div>
  );
}
