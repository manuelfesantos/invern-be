import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { api } from "../lib/api";
import { DataTable } from "../components/data-table/DataTable";
import {
  Badge,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui";
import { formatPrice } from "../lib/format";

const PAGE_SIZE = 10;
const LOW_STOCK = 5;

type Filter = "all" | "low" | "out";

async function fetchStock(page: number, filter: Filter) {
  const { data, error } = await api.GET("/private/products", {
    params: {
      query: {
        page,
        pageSize: PAGE_SIZE,
        sortBy: "stock",
        sortOrder: "asc", // worst-first
        ...(filter === "low" ? { maxStock: LOW_STOCK } : {}),
        ...(filter === "out" ? { maxStock: 0 } : {}),
      },
    },
  });
  if (error) throw error;
  return data.data;
}
type Row = NonNullable<Awaited<ReturnType<typeof fetchStock>>>["data"][number];

function stockCell(stock: number) {
  if (stock <= 0) return <Badge variant="danger">Out</Badge>;
  if (stock <= LOW_STOCK) return <Badge variant="warning">{stock}</Badge>;
  return <span className="text-slate-700">{stock}</span>;
}

const columns: ColumnDef<Row, unknown>[] = [
  { header: "Product", accessorKey: "name" },
  {
    header: "Price",
    cell: ({ row }) => formatPrice(row.original.priceInCents ?? 0),
  },
  { header: "Stock", cell: ({ row }) => stockCell(row.original.stock ?? 0) },
];

export function StockPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>("all");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["stock", page, filter],
    queryFn: () => fetchStock(page, filter),
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-900">Stock</h1>
      <p className="mb-4 text-sm text-slate-500">
        Lowest stock first. Low = {LOW_STOCK} or fewer.
      </p>
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <Label className="text-slate-500">Show</Label>
        <Select
          value={filter}
          onValueChange={(v) => {
            setFilter(v as Filter);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products</SelectItem>
            <SelectItem value="low">Low stock (≤ {LOW_STOCK})</SelectItem>
            <SelectItem value="out">Out of stock</SelectItem>
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
        emptyMessage="No products"
      />
    </div>
  );
}
