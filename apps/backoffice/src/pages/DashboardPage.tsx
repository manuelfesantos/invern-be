import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Card, ErrorState, LoadingState } from "../components/ui";

const CARDS: {
  key: "orders" | "products" | "users" | "collections";
  label: string;
}[] = [
  { key: "orders", label: "Orders" },
  { key: "products", label: "Products" },
  { key: "users", label: "Users" },
  { key: "collections", label: "Collections" },
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

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {data && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CARDS.map((card) => (
            <Card key={card.key} className="p-4">
              <div className="text-2xl font-bold text-slate-900">
                {data.counts?.[card.key] ?? 0}
              </div>
              <div className="text-sm text-slate-500">{card.label}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
