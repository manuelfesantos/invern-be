import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

const CARDS: { key: "orders" | "products" | "users" | "collections"; label: string }[] = [
  { key: "orders", label: "Orders" },
  { key: "products", label: "Products" },
  { key: "users", label: "Users" },
  { key: "collections", label: "Collections" },
];

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data, error } = await api.GET("/private/dashboard");
      if (error) throw error;
      return data.data;
    },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
      {isLoading && <p className="mt-4 text-slate-500">Loading…</p>}
      {isError && <p className="mt-4 text-red-600">Failed to load summary.</p>}
      {data && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CARDS.map((card) => (
            <div
              key={card.key}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="text-2xl font-bold text-slate-900">
                {data.counts?.[card.key] ?? 0}
              </div>
              <div className="text-sm text-slate-500">{card.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
