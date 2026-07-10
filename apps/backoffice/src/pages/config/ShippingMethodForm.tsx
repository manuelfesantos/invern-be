import { useEffect } from "react";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useZodForm } from "../../components/form/use-zod-form";
import { TextField } from "../../components/form/TextField";
import { Button, Dialog, DialogContent, toast } from "../../components/ui";

const schema = z.object({ name: z.string().min(1, "Required") });
type Values = z.infer<typeof schema>;

export function ShippingMethodForm({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: { id: string; name: string } | null;
}) {
  const qc = useQueryClient();
  const isEdit = editing !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useZodForm<Values>(schema, { defaultValues: { name: "" } });

  useEffect(() => {
    if (open) reset({ name: editing?.name ?? "" });
  }, [open, editing, reset]);

  const mutation = useMutation({
    mutationFn: async (values: Values) => {
      if (isEdit) {
        const { error } = await api.PUT("/private/shipping/methods/{id}", {
          params: { path: { id: editing.id } },
          body: values,
        });
        if (error) throw error;
      } else {
        const { error } = await api.POST("/private/shipping/methods", {
          body: values,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Method updated" : "Method created");
      void qc.invalidateQueries({ queryKey: ["shipping-methods"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Something went wrong."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? "Edit method" : "New shipping method"}>
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4"
        >
          <TextField
            label="Name"
            placeholder="Express Air"
            {...register("name")}
            error={errors.name?.message}
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
