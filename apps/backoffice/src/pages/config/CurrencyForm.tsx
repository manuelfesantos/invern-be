import { useEffect, useState } from "react";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useZodForm } from "../../components/form/use-zod-form";
import { TextField } from "../../components/form/TextField";
import {
  Button,
  Combobox,
  Dialog,
  DialogContent,
  Input,
  Label,
  toast,
} from "../../components/ui";
import { CURRENCIES, currencyName, currencySymbol } from "../../lib/geo";
import { fetchRateToEuro } from "../../lib/fx";

const schema = z.object({
  code: z.string().regex(/^[A-Z]{3}$/, "3 uppercase letters, e.g. USD"),
  name: z.string().min(1, "Required"),
  symbol: z.string().min(1, "Required"),
  rateToEuro: z.coerce.number().nonnegative("Must be ≥ 0"),
  stripeName: z.string().min(1, "Required"),
});
type Values = z.infer<typeof schema>;

export function CurrencyForm({
  open,
  onOpenChange,
  editingCode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCode: string | null;
}) {
  const qc = useQueryClient();
  const isEdit = editingCode !== null;
  const [rateLoading, setRateLoading] = useState(false);

  const { data: detail } = useQuery({
    queryKey: ["currency", editingCode],
    enabled: isEdit && open,
    queryFn: async () => {
      const { data, error } = await api.GET("/private/currencies/{code}", {
        params: { path: { code: editingCode ?? "" } },
      });
      if (error) throw error;
      return data.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useZodForm<Values>(schema, {
    defaultValues: { code: "", name: "", symbol: "", rateToEuro: 1, stripeName: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      code: detail?.code ?? "",
      name: detail?.name ?? "",
      symbol: detail?.symbol ?? "",
      rateToEuro: detail?.rateToEuro ?? 1,
      stripeName: detail?.stripeName ?? "",
    });
  }, [open, detail, reset]);

  const code = watch("code");

  async function loadRate(currencyCode: string) {
    setRateLoading(true);
    const rate = await fetchRateToEuro(currencyCode);
    if (rate != null) setValue("rateToEuro", rate, { shouldValidate: true });
    setRateLoading(false);
  }

  // Pick a currency from the world list → prefill name, symbol, Stripe name,
  // and the live EUR rate. All stay editable afterwards.
  async function pickCurrency(v: string) {
    setValue("code", v, { shouldValidate: true });
    setValue("name", currencyName(v), { shouldValidate: true });
    setValue("symbol", currencySymbol(v), { shouldValidate: true });
    setValue("stripeName", v.toLowerCase(), { shouldValidate: true });
    await loadRate(v);
  }

  const mutation = useMutation({
    mutationFn: async (values: Values) => {
      if (isEdit) {
        const { error } = await api.PUT("/private/currencies/{code}", {
          params: { path: { code: editingCode ?? "" } },
          body: values,
        });
        if (error) throw error;
      } else {
        const { error } = await api.POST("/private/currencies", { body: values });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Currency updated" : "Currency created");
      void qc.invalidateQueries({ queryKey: ["currencies"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Something went wrong."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? "Edit currency" : "New currency"}>
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4"
        >
          <div className="space-y-1">
            <Label>Currency</Label>
            {isEdit ? (
              <Input value={code} disabled />
            ) : (
              <Combobox
                options={CURRENCIES}
                value={code}
                onChange={pickCurrency}
                placeholder="Search world currencies…"
                invalid={!!errors.code}
              />
            )}
            {errors.code && (
              <p className="text-xs text-red-600">{errors.code.message}</p>
            )}
          </div>
          <TextField
            label="Name"
            {...register("name")}
            error={errors.name?.message}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Symbol"
              {...register("symbol")}
              error={errors.symbol?.message}
            />
            <TextField
              label="Rate to EUR"
              type="number"
              step="0.0001"
              {...register("rateToEuro")}
              error={errors.rateToEuro?.message}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              1 EUR = <em>rate</em> of this currency. Editable — no live FX at
              checkout.
            </p>
            <button
              type="button"
              disabled={!/^[A-Z]{3}$/.test(code) || rateLoading}
              onClick={() => void loadRate(code)}
              className="shrink-0 text-xs text-slate-600 underline disabled:opacity-40"
            >
              {rateLoading ? "Fetching…" : "↻ Live rate"}
            </button>
          </div>
          <TextField
            label="Stripe name"
            placeholder="usd"
            {...register("stripeName")}
            error={errors.stripeName?.message}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
