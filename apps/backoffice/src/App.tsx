import { useQuery } from "@tanstack/react-query";
import { api } from "./lib/api";

// Scaffolding smoke screen: a typed, TanStack-Query call through the generated
// api-client. Proves env config → client → query → render end to end. Real
// screens (Feature 17+) replace this.
function App() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const { data, error } = await api.GET("/health");
      if (error) throw error;
      return data;
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <h1 className="text-2xl font-bold">Invern Spirit — Backoffice</h1>
      <p className="mt-2 text-slate-600">
        Scaffolding smoke test: a typed call to the backend via TanStack Query.
      </p>
      <section className="mt-6 max-w-sm rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">API health</h2>
        {isLoading && <p className="text-slate-500">checking…</p>}
        {isError && <p className="text-red-600">unreachable</p>}
        {data && (
          <ul className="mt-2 space-y-1 font-mono text-sm">
            <li>status: {data.status}</li>
            <li>d1: {data.checks.d1}</li>
            <li>kv: {data.checks.kv}</li>
            <li>r2: {data.checks.r2}</li>
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;
