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
  Textarea,
  toast,
} from "../../components/ui";
import { ProductImages } from "./ProductImages";

const schema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  priceEuros: z.coerce.number().nonnegative("Must be ≥ 0"),
  weight: z.coerce.number().int().nonnegative("Must be ≥ 0"),
  collectionId: z.string().uuid("Choose a collection"),
  stock: z.coerce.number().int().nonnegative("Must be ≥ 0"),
});
type Values = z.infer<typeof schema>;

async function fetchCollections() {
  const { data, error } = await api.GET("/private/collections", {
    params: { query: { page: 1, pageSize: 100 } },
  });
  if (error) throw error;
  return data.data?.data ?? [];
}

export function ProductForm({
  open,
  onOpenChange,
  editingId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
}) {
  const qc = useQueryClient();
  const isEdit = editingId !== null;

  const { data: collections } = useQuery({
    queryKey: ["collections", "all"],
    enabled: open,
    queryFn: fetchCollections,
  });

  const { data: detail } = useQuery({
    queryKey: ["product", editingId],
    enabled: isEdit && open,
    queryFn: async () => {
      const { data, error } = await api.GET("/private/products/{id}", {
        params: { path: { id: editingId ?? "" } },
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
    defaultValues: {
      name: "",
      description: "",
      priceEuros: 0,
      weight: 0,
      collectionId: "",
      stock: 0,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: detail?.name ?? "",
      description: detail?.description ?? "",
      priceEuros: (detail?.priceInCents ?? 0) / 100,
      weight: detail?.weight ?? 0,
      collectionId: detail?.collectionId ?? "",
      stock: detail?.stock ?? 0,
    });
  }, [open, detail, reset]);

  const collectionId = watch("collectionId");

  const mutation = useMutation({
    mutationFn: async (values: Values) => {
      const base = {
        name: values.name,
        description: values.description,
        priceInCents: Math.round(values.priceEuros * 100),
        weight: values.weight,
        collectionId: values.collectionId,
      };
      if (isEdit) {
        const { error } = await api.PUT("/private/products/{id}", {
          params: { path: { id: editingId ?? "" } },
          body: base, // stock intentionally excluded (safe stock path)
        });
        if (error) throw error;
      } else {
        const { error } = await api.POST("/private/products", {
          body: { ...base, stock: values.stock },
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Product updated" : "Product created");
      void qc.invalidateQueries({ queryKey: ["products"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Something went wrong."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={isEdit ? "Edit product" : "New product"}
        className="max-w-lg"
      >
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4"
        >
          <TextField
            label="Name"
            {...register("name")}
            error={errors.name?.message}
          />
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} {...register("description")} />
            {errors.description && (
              <p className="text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Price (€)"
              type="number"
              step="0.01"
              {...register("priceEuros")}
              error={errors.priceEuros?.message}
            />
            <TextField
              label="Weight (g)"
              type="number"
              {...register("weight")}
              error={errors.weight?.message}
            />
          </div>
          <div className="space-y-1">
            <Label>Collection</Label>
            <Select
              value={collectionId}
              onValueChange={(v) =>
                setValue("collectionId", v, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent>
                {collections?.map((c) => (
                  <SelectItem key={c.id} value={c.id ?? ""}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.collectionId && (
              <p className="text-xs text-red-600">
                {errors.collectionId.message}
              </p>
            )}
          </div>
          {isEdit ? (
            <p className="text-xs text-slate-400">
              Stock ({detail?.stock ?? "—"}) is managed on the Stock screen.
            </p>
          ) : (
            <TextField
              label="Initial stock"
              type="number"
              {...register("stock")}
              error={errors.stock?.message}
            />
          )}
          {isEdit && editingId && <ProductImages productId={editingId} />}
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
