import { useEffect, useState } from "react";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useZodForm } from "../../components/form/use-zod-form";
import { TextField } from "../../components/form/TextField";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  Label,
  toast,
} from "../../components/ui";

export interface RateValues {
  id: string;
  priceInCents: number;
  minWeight: number;
  maxWeight: number;
  deliveryTime: number;
  countryCodes: string[];
}

// Price entered in euros; weight band is half-open [min, max) in grams.
const schema = z
  .object({
    priceEuros: z.coerce.number().nonnegative("≥ 0"),
    minWeight: z.coerce.number().int().nonnegative("≥ 0"),
    maxWeight: z.coerce.number().int().nonnegative("≥ 0"),
    deliveryTime: z.coerce.number().int().nonnegative("≥ 0"),
  })
  .refine((v) => v.maxWeight > v.minWeight, {
    message: "Max weight must be greater than min",
    path: ["maxWeight"],
  });
type Values = z.infer<typeof schema>;

async function fetchCountries() {
  const { data, error } = await api.GET("/private/countries", {
    params: { query: { page: 1, pageSize: 100 } },
  });
  if (error) throw error;
  return data.data?.data ?? [];
}

export function ShippingRateForm({
  open,
  onOpenChange,
  methodId,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  methodId: string;
  editing: RateValues | null;
}) {
  const qc = useQueryClient();
  const isEdit = editing !== null;
  const [countryCodes, setCountryCodes] = useState<Set<string>>(new Set());

  const { data: countries } = useQuery({
    queryKey: ["countries", "all"],
    enabled: open,
    queryFn: fetchCountries,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useZodForm<Values>(schema, {
    defaultValues: { priceEuros: 0, minWeight: 0, maxWeight: 1000, deliveryTime: 1 },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      priceEuros: editing ? editing.priceInCents / 100 : 0,
      minWeight: editing?.minWeight ?? 0,
      maxWeight: editing?.maxWeight ?? 1000,
      deliveryTime: editing?.deliveryTime ?? 1,
    });
    setCountryCodes(new Set(editing?.countryCodes ?? []));
  }, [open, editing, reset]);

  const toggle = (code: string) =>
    setCountryCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const mutation = useMutation({
    mutationFn: async (values: Values) => {
      const body = {
        priceInCents: Math.round(values.priceEuros * 100),
        minWeight: values.minWeight,
        maxWeight: values.maxWeight,
        deliveryTime: values.deliveryTime,
      };
      const codes = [...countryCodes];
      let rateId: string;
      if (isEdit) {
        const { error } = await api.PUT(
          "/private/shipping/methods/{methodId}/rates/{rateId}",
          { params: { path: { methodId, rateId: editing.id } }, body },
        );
        if (error) throw error;
        rateId = editing.id;
      } else {
        // Create the rate, then assign its countries (separate endpoint that
        // needs the new rate id).
        const { data, error } = await api.POST(
          "/private/shipping/methods/{methodId}/rates",
          { params: { path: { methodId } }, body },
        );
        if (error) throw error;
        rateId = data?.data?.id ?? "";
      }
      if (rateId) {
        const { error } = await api.PUT(
          "/private/shipping/methods/{methodId}/rates/{rateId}/countries",
          {
            params: { path: { methodId, rateId } },
            body: { countryCodes: codes },
          },
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Rate updated" : "Rate created");
      void qc.invalidateQueries({ queryKey: ["shipping-methods"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Something went wrong."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? "Edit rate" : "New rate"}>
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Min weight (g)"
              type="number"
              {...register("minWeight")}
              error={errors.minWeight?.message}
            />
            <TextField
              label="Max weight (g)"
              type="number"
              {...register("maxWeight")}
              error={errors.maxWeight?.message}
            />
          </div>
          <p className="text-xs text-slate-400">
            Half-open band [min, max) — the max of one rate should equal the min
            of the next to avoid gaps.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Price (€)"
              type="number"
              step="0.01"
              {...register("priceEuros")}
              error={errors.priceEuros?.message}
            />
            <TextField
              label="Delivery (days)"
              type="number"
              {...register("deliveryTime")}
              error={errors.deliveryTime?.message}
            />
          </div>
          <div className="space-y-1">
            <Label>Countries</Label>
            <div className="max-h-40 space-y-1 overflow-auto rounded-md border border-slate-200 p-2">
              {countries?.length ? (
                countries.map((c) => (
                  <label
                    key={c.code}
                    className="flex items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Checkbox
                      checked={countryCodes.has(c.code ?? "")}
                      onCheckedChange={() => toggle(c.code ?? "")}
                    />
                    <span className="font-mono text-xs text-slate-500">
                      {c.code}
                    </span>
                    {c.name}
                  </label>
                ))
              ) : (
                <p className="px-1 text-sm text-slate-400">
                  No countries yet — add one under Countries first.
                </p>
              )}
            </div>
            {countryCodes.size === 0 && (
              <p className="text-xs text-amber-600">
                No countries selected — this rate won't be offered at checkout.
              </p>
            )}
          </div>
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
