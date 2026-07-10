import { useEffect } from "react";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useZodForm } from "../../components/form/use-zod-form";
import { TextField } from "../../components/form/TextField";
import { Button, Dialog, DialogContent, toast } from "../../components/ui";

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
          <TextField
            label="Code"
            placeholder="USD"
            disabled={isEdit}
            {...register("code")}
            error={errors.code?.message}
          />
          <TextField
            label="Name"
            {...register("name")}
            error={errors.name?.message}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Symbol"
              placeholder="$"
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
          <p className="text-xs text-slate-400">
            Rate to EUR is maintained manually (no live FX feed): 1 EUR ={" "}
            <em>rate</em> of this currency.
          </p>
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
