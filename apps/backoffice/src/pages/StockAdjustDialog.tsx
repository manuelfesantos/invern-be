import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  Button,
  Dialog,
  DialogContent,
  Input,
  Label,
  toast,
} from "../components/ui";

// Re-read current stock on open (it can change from checkout reservations).
async function fetchProduct(id: string) {
  const { data, error } = await api.GET("/private/products/{id}", {
    params: { path: { id } },
  });
  if (error) throw error;
  return data.data;
}

export function StockAdjustDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: { id: string; name: string; stock: number } | null;
}) {
  const qc = useQueryClient();
  const [value, setValue] = useState("0");

  const { data: detail } = useQuery({
    queryKey: ["product", product?.id],
    enabled: open && !!product,
    queryFn: () => fetchProduct(product?.id ?? ""),
  });

  const current = detail?.stock ?? product?.stock ?? 0;

  useEffect(() => {
    if (open) setValue(String(current));
  }, [open, current]);

  const parsed = Number(value);
  const invalid = !Number.isInteger(parsed) || parsed < 0;

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await api.PUT("/private/stock/{productId}", {
        params: { path: { productId: product?.id ?? "" } },
        body: { stock: parsed },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Stock set to ${parsed}`);
      void qc.invalidateQueries({ queryKey: ["stock"] });
      void qc.invalidateQueries({ queryKey: ["products"] });
      void qc.invalidateQueries({ queryKey: ["product", product?.id] });
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update stock."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Adjust stock"
        description={product?.name}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Current stock: <span className="font-medium">{current}</span>
          </p>
          <div className="space-y-1">
            <Label htmlFor="stock-value">New stock (absolute)</Label>
            <Input
              id="stock-value"
              type="number"
              min={0}
              step={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              aria-invalid={invalid ? true : undefined}
            />
            {invalid && (
              <p className="text-xs text-red-600">
                Enter a non-negative whole number.
              </p>
            )}
            {!invalid && parsed === 0 && (
              <p className="text-xs text-amber-600">
                Setting stock to 0 makes this product unsellable.
              </p>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Writes through to all stores (D1, KV, R2) at once.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={invalid || parsed === current || mutation.isPending}
            >
              {mutation.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
