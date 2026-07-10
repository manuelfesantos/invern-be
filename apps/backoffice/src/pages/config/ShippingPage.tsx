import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../../lib/api";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  toast,
} from "../../components/ui";
import { formatPrice } from "../../lib/format";
import { ShippingMethodForm } from "./ShippingMethodForm";
import { ShippingRateForm, type RateValues } from "./ShippingRateForm";
import { RateCountriesDialog } from "./RateCountriesDialog";

async function fetchMethods() {
  const { data, error } = await api.GET("/private/shipping/methods", {
    params: { query: { page: 1, pageSize: 50 } },
  });
  if (error) throw error;
  return data.data;
}
type Method = NonNullable<
  Awaited<ReturnType<typeof fetchMethods>>
>["data"][number];
type Rate = NonNullable<Method["rates"]>[number];

// Per-country overlap/gap detection across a method's half-open [min,max) bands.
function bandIssues(rates: Rate[]): string[] {
  const byCountry = new Map<string, { min: number; max: number }[]>();
  for (const r of rates) {
    for (const cc of r.countryCodes ?? []) {
      const list = byCountry.get(cc) ?? [];
      list.push({ min: r.minWeight ?? 0, max: r.maxWeight ?? 0 });
      byCountry.set(cc, list);
    }
  }
  const issues: string[] = [];
  for (const [cc, bands] of byCountry) {
    bands.sort((a, b) => a.min - b.min);
    for (let i = 1; i < bands.length; i++) {
      const prev = bands[i - 1];
      const cur = bands[i];
      if (cur.min < prev.max) issues.push(`${cc}: bands overlap near ${cur.min}g`);
      else if (cur.min > prev.max) issues.push(`${cc}: gap ${prev.max}–${cur.min}g`);
    }
  }
  return issues;
}

const toRateValues = (r: Rate): RateValues => ({
  id: r.id ?? "",
  priceInCents: r.priceInCents ?? 0,
  minWeight: r.minWeight ?? 0,
  maxWeight: r.maxWeight ?? 0,
  deliveryTime: r.deliveryTime ?? 0,
});

export function ShippingPage() {
  const qc = useQueryClient();
  const [methodForm, setMethodForm] = useState<{
    open: boolean;
    editing: { id: string; name: string } | null;
  }>({ open: false, editing: null });
  const [rateForm, setRateForm] = useState<{
    open: boolean;
    methodId: string;
    editing: RateValues | null;
  }>({ open: false, methodId: "", editing: null });
  const [countriesFor, setCountriesFor] = useState<{
    methodId: string;
    rate: Rate;
  } | null>(null);
  const [deleteMethod, setDeleteMethod] = useState<Method | null>(null);
  const [deleteRate, setDeleteRate] = useState<{
    methodId: string;
    rate: Rate;
  } | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["shipping-methods"],
    queryFn: fetchMethods,
    placeholderData: keepPreviousData,
  });

  const delMethod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE("/private/shipping/methods/{id}", {
        params: { path: { id } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Method deleted");
      void qc.invalidateQueries({ queryKey: ["shipping-methods"] });
      setDeleteMethod(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  const delRate = useMutation({
    mutationFn: async ({ methodId, rateId }: { methodId: string; rateId: string }) => {
      const { error } = await api.DELETE(
        "/private/shipping/methods/{methodId}/rates/{rateId}",
        { params: { path: { methodId, rateId } } },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rate deleted");
      void qc.invalidateQueries({ queryKey: ["shipping-methods"] });
      setDeleteRate(null);
    },
    onError: () => toast.error("Delete failed."),
  });

  const methods = data?.data ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Shipping</h1>
        <Button onClick={() => setMethodForm({ open: true, editing: null })}>
          New method
        </Button>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && methods.length === 0 && (
        <EmptyState title="No shipping methods yet" />
      )}

      <div className="space-y-4">
        {methods.map((m) => {
          const rates = [...(m.rates ?? [])].sort(
            (a, b) => (a.minWeight ?? 0) - (b.minWeight ?? 0),
          );
          const issues = bandIssues(rates);
          return (
            <Card key={m.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-slate-900">{m.name}</h2>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setRateForm({
                        open: true,
                        methodId: m.id ?? "",
                        editing: null,
                      })
                    }
                  >
                    Add rate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setMethodForm({
                        open: true,
                        editing: { id: m.id ?? "", name: m.name ?? "" },
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      // Backend refuses (409) to delete a method with rates —
                      // guide the user to clear them first.
                      if (rates.length > 0) {
                        toast.error("Remove this method's rates first.");
                      } else {
                        setDeleteMethod(m);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {issues.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-xs text-amber-600">
                  {issues.map((i) => (
                    <li key={i}>⚠ {i}</li>
                  ))}
                </ul>
              )}

              {rates.length === 0 ? (
                <p className="mt-3 text-sm text-slate-400">No rates yet.</p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-slate-500">
                      <tr>
                        <th className="py-1 pr-4 font-medium">Band (g)</th>
                        <th className="py-1 pr-4 font-medium">Price</th>
                        <th className="py-1 pr-4 font-medium">Delivery</th>
                        <th className="py-1 pr-4 font-medium">Countries</th>
                        <th className="py-1" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rates.map((r) => (
                        <tr key={r.id}>
                          <td className="whitespace-nowrap py-2 pr-4 text-slate-700">
                            {r.minWeight ?? 0}–{r.maxWeight ?? 0}
                          </td>
                          <td className="whitespace-nowrap py-2 pr-4 text-slate-700">
                            {formatPrice(r.priceInCents ?? 0)}
                          </td>
                          <td className="whitespace-nowrap py-2 pr-4 text-slate-700">
                            {r.deliveryTime ?? 0}d
                          </td>
                          <td className="py-2 pr-4">
                            {r.countryCodes && r.countryCodes.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {r.countryCodes.map((cc) => (
                                  <Badge key={cc}>{cc}</Badge>
                                ))}
                              </div>
                            ) : (
                              <Badge variant="warning">none</Badge>
                            )}
                          </td>
                          <td className="whitespace-nowrap py-2 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setRateForm({
                                  open: true,
                                  methodId: m.id ?? "",
                                  editing: toRateValues(r),
                                })
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setCountriesFor({ methodId: m.id ?? "", rate: r })
                              }
                            >
                              Countries
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setDeleteRate({ methodId: m.id ?? "", rate: r })
                              }
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <ShippingMethodForm
        open={methodForm.open}
        onOpenChange={(o) => setMethodForm((s) => ({ ...s, open: o }))}
        editing={methodForm.editing}
      />
      <ShippingRateForm
        open={rateForm.open}
        onOpenChange={(o) => setRateForm((s) => ({ ...s, open: o }))}
        methodId={rateForm.methodId}
        editing={rateForm.editing}
      />
      {countriesFor && (
        <RateCountriesDialog
          open={countriesFor !== null}
          onOpenChange={(o) => !o && setCountriesFor(null)}
          methodId={countriesFor.methodId}
          rateId={countriesFor.rate.id ?? ""}
          current={countriesFor.rate.countryCodes ?? []}
        />
      )}
      <ConfirmDialog
        open={deleteMethod !== null}
        onOpenChange={(o) => !o && setDeleteMethod(null)}
        title={`Delete method ${deleteMethod?.name}?`}
        description="This removes the shipping method. (Only methods with no rates can be deleted.) This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => deleteMethod?.id && delMethod.mutate(deleteMethod.id)}
        isPending={delMethod.isPending}
      />
      <ConfirmDialog
        open={deleteRate !== null}
        onOpenChange={(o) => !o && setDeleteRate(null)}
        title="Delete rate?"
        description="This removes the weight-band rate and its country coverage."
        confirmLabel="Delete"
        onConfirm={() =>
          deleteRate?.rate.id &&
          delRate.mutate({
            methodId: deleteRate.methodId,
            rateId: deleteRate.rate.id,
          })
        }
        isPending={delRate.isPending}
      />
    </div>
  );
}
