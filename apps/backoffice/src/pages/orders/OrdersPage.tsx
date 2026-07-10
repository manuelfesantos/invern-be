import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { api } from "../../lib/api";
import { DataTable } from "../../components/data-table/DataTable";
import { Badge } from "../../components/ui";
import { formatDate, formatPrice, shortId } from "../../lib/format";
import { fulfillmentBadge, paymentBadge } from "./order-status";

const PAGE_SIZE = 10;

async function fetchOrders(page: number) {
  const { data, error } = await api.GET("/private/orders", {
    params: {
      query: { page, pageSize: PAGE_SIZE, sortBy: "createdAt", sortOrder: "desc" },
    },
  });
  if (error) throw error;
  return data.data;
}
type Row = NonNullable<Awaited<ReturnType<typeof fetchOrders>>>["data"][number];

function customerName(o: Row): string {
  const { firstName, lastName, email } = o.personalDetails ?? {};
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return name || email || "—";
}

const columns: ColumnDef<Row, unknown>[] = [
  {
    header: "Order",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-slate-500">
        {shortId(row.original.id)}
      </span>
    ),
  },
  {
    header: "Date",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  { header: "Customer", cell: ({ row }) => customerName(row.original) },
  {
    header: "Total",
    cell: ({ row }) => formatPrice(row.original.payment?.grossAmount ?? 0),
  },
  {
    header: "Payment",
    cell: ({ row }) => {
      if (row.original.isCanceled)
        return <Badge variant="danger">canceled</Badge>;
      const b = paymentBadge(row.original.payment?.state);
      return <Badge variant={b.variant}>{b.label}</Badge>;
    },
  },
  {
    header: "Fulfillment",
    cell: ({ row }) => {
      const b = fulfillmentBadge(row.original.shippingTransaction?.status);
      return <Badge variant={b.variant}>{b.label}</Badge>;
    },
  },
];

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orders", page],
    queryFn: () => fetchOrders(page),
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Orders</h1>
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
        emptyMessage="No orders yet"
        onRowClick={(o) => navigate(`/orders/${o.id}`)}
      />
    </div>
  );
}
