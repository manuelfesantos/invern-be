import { useEffect } from "react";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useZodForm } from "../../components/form/use-zod-form";
import { TextField } from "../../components/form/TextField";
import {
  Button,
  Dialog,
  DialogContent,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from "../../components/ui";

const schema = z.object({
  code: z.string().regex(/^[A-Z]{2}$/, "2 uppercase letters, e.g. PT"),
  name: z.string().min(1, "Required"),
  locale: z.string().regex(/^[a-z]{2}-[A-Z]{2}$/, "e.g. pt-PT"),
  currencyCode: z.string().regex(/^[A-Z]{3}$/, "Choose a currency"),
});
type Values = z.infer<typeof schema>;

async function fetchCurrencies() {
  const { data, error } = await api.GET("/private/currencies", {
    params: { query: { page: 1, pageSize: 100 } },
  });
  if (error) throw error;
  return data.data?.data ?? [];
}

export function CountryForm({
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

  const { data: currencies } = useQuery({
    queryKey: ["currencies", "all"],
    enabled: open,
    queryFn: fetchCurrencies,
  });

  const { data: detail } = useQuery({
    queryKey: ["country", editingCode],
    enabled: isEdit && open,
    queryFn: async () => {
      const { data, error } = await api.GET("/private/countries/{code}", {
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
    defaultValues: { code: "", name: "", locale: "", currencyCode: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      code: detail?.code ?? "",
      name: detail?.name ?? "",
      locale: detail?.locale ?? "",
      currencyCode: detail?.currency?.code ?? "",
    });
  }, [open, detail, reset]);

  const currencyCode = watch("currencyCode");
  const noCurrencies = currencies !== undefined && currencies.length === 0;

  const mutation = useMutation({
    mutationFn: async (values: Values) => {
      if (isEdit) {
        const { error } = await api.PUT("/private/countries/{code}", {
          params: { path: { code: editingCode ?? "" } },
          body: values,
        });
        if (error) throw error;
      } else {
        const { error } = await api.POST("/private/countries", { body: values });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Country updated" : "Country created");
      void qc.invalidateQueries({ queryKey: ["countries"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Something went wrong."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? "Edit country" : "New country"}>
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Code"
              placeholder="PT"
              disabled={isEdit}
              {...register("code")}
              error={errors.code?.message}
            />
            <TextField
              label="Locale"
              placeholder="pt-PT"
              {...register("locale")}
              error={errors.locale?.message}
            />
          </div>
          <TextField
            label="Name"
            {...register("name")}
            error={errors.name?.message}
          />
          <div className="space-y-1">
            <Label>Currency</Label>
            <Select
              value={currencyCode}
              onValueChange={(v) =>
                setValue("currencyCode", v, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies?.map((cur) => (
                  <SelectItem key={cur.code} value={cur.code ?? ""}>
                    {cur.code} — {cur.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {noCurrencies && (
              <p className="text-xs text-amber-600">
                No currencies exist yet — create a currency first.
              </p>
            )}
            {errors.currencyCode && (
              <p className="text-xs text-red-600">
                {errors.currencyCode.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || noCurrencies}>
              {mutation.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
