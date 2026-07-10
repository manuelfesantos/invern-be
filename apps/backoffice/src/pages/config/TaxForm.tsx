import { useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  toast,
} from "../../components/ui";

// Create: rate entered as a percentage (23), stored as a fraction (0.23).
const createSchema = z.object({
  name: z.string().min(1, "Required"),
  countryCode: z.string().regex(/^[A-Z]{2}$/, "Choose a country"),
  ratePercent: z.coerce.number().min(0, "≥ 0").max(100, "≤ 100"),
  inclusive: z.boolean(),
  description: z.string().optional(),
});
type CreateValues = z.infer<typeof createSchema>;

async function fetchCountries() {
  const { data, error } = await api.GET("/private/countries", {
    params: { query: { page: 1, pageSize: 100 } },
  });
  if (error) throw error;
  return data.data?.data ?? [];
}

export function TaxForm({
  open,
  onOpenChange,
  editing,
  defaultCountry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Editing an existing tax: rate & country are immutable, so we only need its
  // id + read-only display fields.
  editing: { id: string; name: string; rate: number; countryCode: string } | null;
  defaultCountry?: string;
}) {
  const qc = useQueryClient();
  const isEdit = editing !== null;

  const { data: countries } = useQuery({
    queryKey: ["countries", "all"],
    enabled: open && !isEdit,
    queryFn: fetchCountries,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useZodForm<CreateValues>(createSchema, {
    defaultValues: {
      name: "",
      countryCode: defaultCountry ?? "",
      ratePercent: 0,
      inclusive: false,
      description: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: editing?.name ?? "",
      countryCode: editing?.countryCode ?? defaultCountry ?? "",
      ratePercent: editing ? editing.rate * 100 : 0,
      inclusive: false,
      description: "",
    });
  }, [open, editing, defaultCountry, reset]);

  const countryCode = watch("countryCode");
  const inclusive = watch("inclusive");

  const mutation = useMutation({
    mutationFn: async (values: CreateValues) => {
      if (isEdit) {
        // rate & country are immutable — only name/description are editable.
        const { error } = await api.PUT("/private/taxes/{id}", {
          params: { path: { id: editing.id } },
          body: { name: values.name, description: values.description },
        });
        if (error) throw error;
      } else {
        const { error } = await api.POST("/private/taxes", {
          body: {
            name: values.name,
            countryCode: values.countryCode,
            rate: values.ratePercent / 100,
            inclusive: values.inclusive,
            description: values.description || undefined,
          },
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Tax updated" : "Tax created");
      void qc.invalidateQueries({ queryKey: ["taxes"] });
      void qc.invalidateQueries({ queryKey: ["countries"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Something went wrong."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? "Edit tax" : "New tax"}>
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4"
        >
          <TextField
            label="Name"
            placeholder="VAT"
            {...register("name")}
            error={errors.name?.message}
          />
          {isEdit ? (
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <div>
                Country <span className="font-mono">{editing.countryCode}</span>{" "}
                · Rate {+(editing.rate * 100).toFixed(4)}%
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Rate and country are immutable (they map to a Stripe tax rate).
                To change them, delete this and create a new one.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <Label>Country</Label>
                <Select
                  value={countryCode}
                  onValueChange={(v) =>
                    setValue("countryCode", v, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries?.map((c) => (
                      <SelectItem key={c.code} value={c.code ?? ""}>
                        {c.code} — {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.countryCode && (
                  <p className="text-xs text-red-600">
                    {errors.countryCode.message}
                  </p>
                )}
              </div>
              <TextField
                label="Rate (%)"
                type="number"
                step="0.01"
                placeholder="23"
                {...register("ratePercent")}
                error={errors.ratePercent?.message}
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <Checkbox
                  checked={inclusive}
                  onCheckedChange={(v) => setValue("inclusive", v === true)}
                />
                Tax is included in the price
              </label>
              <p className="text-xs text-slate-400">
                Creating a tax registers a rate in Stripe (test mode).
              </p>
            </>
          )}
          <div className="space-y-1">
            <Label htmlFor="tax-description">Description (optional)</Label>
            <Textarea id="tax-description" rows={2} {...register("description")} />
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
