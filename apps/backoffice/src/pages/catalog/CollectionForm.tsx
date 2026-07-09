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
  Textarea,
  toast,
} from "../../components/ui";

const schema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
});
type Values = z.infer<typeof schema>;

export function CollectionForm({
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

  // Fetch full detail on edit (the list projection omits description).
  const { data: detail } = useQuery({
    queryKey: ["collection", editingId],
    enabled: isEdit && open,
    queryFn: async () => {
      const { data, error } = await api.GET("/private/collections/{id}", {
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
    formState: { errors },
  } = useZodForm<Values>(schema, { defaultValues: { name: "", description: "" } });

  useEffect(() => {
    if (open) {
      reset({
        name: detail?.name ?? "",
        description: detail?.description ?? "",
      });
    }
  }, [open, detail, reset]);

  const mutation = useMutation({
    mutationFn: async (values: Values) => {
      if (isEdit) {
        const { error } = await api.PUT("/private/collections/{id}", {
          params: { path: { id: editingId ?? "" } },
          body: values,
        });
        if (error) throw error;
      } else {
        const { error } = await api.POST("/private/collections", {
          body: values,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Collection updated" : "Collection created");
      void qc.invalidateQueries({ queryKey: ["collections"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Something went wrong."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? "Edit collection" : "New collection"}>
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
            <Textarea
              id="description"
              rows={3}
              {...register("description")}
              aria-invalid={errors.description ? true : undefined}
            />
            {errors.description && (
              <p className="text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
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
