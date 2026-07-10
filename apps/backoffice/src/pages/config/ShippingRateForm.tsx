import { useEffect } from "react";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useZodForm } from "../../components/form/use-zod-form";
import { TextField } from "../../components/form/TextField";
import { Button, Dialog, DialogContent, toast } from "../../components/ui";

export interface RateValues {
  id: string;
  priceInCents: number;
  minWeight: number;
  maxWeight: number;
  deliveryTime: number;
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
  }, [open, editing, reset]);

  const mutation = useMutation({
    mutationFn: async (values: Values) => {
      const body = {
        priceInCents: Math.round(values.priceEuros * 100),
        minWeight: values.minWeight,
        maxWeight: values.maxWeight,
        deliveryTime: values.deliveryTime,
      };
      if (isEdit) {
        const { error } = await api.PUT(
          "/private/shipping/methods/{methodId}/rates/{rateId}",
          { params: { path: { methodId, rateId: editing.id } }, body },
        );
        if (error) throw error;
      } else {
        const { error } = await api.POST(
          "/private/shipping/methods/{methodId}/rates",
          { params: { path: { methodId } }, body },
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
