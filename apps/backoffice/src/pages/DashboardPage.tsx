import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Badge, Card, ErrorState, LoadingState } from "../components/ui";
import { formatDate, shortId } from "../lib/format";

const CARDS: {
  key: "orders" | "products" | "users" | "collections";
  label: string;
  to: string;
}[] = [
  { key: "orders", label: "Orders", to: "/orders" },
  { key: "products", label: "Products", to: "/products" },
  { key: "users", label: "Users", to: "/users" },
  { key: "collections", label: "Collections", to: "/collections" },
];

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data, error } = await api.GET("/private/dashboard");
      if (error) throw error;
      return data.data;
    },
  });

  const lowStock = data?.lowStock ?? [];
  const recentOrders = data?.recentOrders ?? [];

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {data && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CARDS.map((card) => (
              <Link key={card.key} to={card.to}>
                <Card className="p-4 transition-colors hover:bg-slate-50">
                  <div className="text-2xl font-bold text-slate-900">
                    {data.counts?.[card.key] ?? 0}
                  </div>
                  <div className="text-sm text-slate-500">{card.label}</div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Low stock */}
            <Card className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  Low stock
                </h2>
                <Link
                  to="/stock"
                  className="text-xs text-slate-500 hover:underline"
                >
                  Manage stock
                </Link>
              </div>
              {lowStock.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-400">
                  No low-stock products
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {lowStock.map((p) => (
                    <li key={p.id}>
                      <Link
                        to="/stock"
                        className="flex items-center justify-between gap-3 rounded px-1 py-2 text-sm hover:bg-slate-50"
                      >
                        <span className="truncate text-slate-700">
                          {p.name}
                        </span>
                        <Badge
                          variant={(p.stock ?? 0) <= 0 ? "danger" : "warning"}
                        >
                          {(p.stock ?? 0) <= 0 ? "Out" : p.stock}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Recent orders */}
            <Card className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  Recent orders
                </h2>
                <Link
                  to="/orders"
                  className="text-xs text-slate-500 hover:underline"
                >
                  All orders
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-400">
                  No orders yet
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentOrders.map((o) => (
                    <li key={o.id}>
                      <Link
                        to={`/orders/${o.id}`}
                        className="flex items-center justify-between gap-3 rounded px-1 py-2 text-sm hover:bg-slate-50"
                      >
                        <span className="font-mono text-xs text-slate-500">
                          {shortId(o.id ?? "")}
                        </span>
                        <span className="text-slate-600">
                          {o.createdAt ? formatDate(o.createdAt) : "—"}
                        </span>
                        {o.isCanceled && (
                          <Badge variant="danger">Canceled</Badge>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
