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
  const [delta, setDelta] = useState("0");

  const { data: detail } = useQuery({
    queryKey: ["product", product?.id],
    enabled: open && !!product,
    queryFn: () => fetchProduct(product?.id ?? ""),
  });

  const current = detail?.stock ?? product?.stock ?? 0;

  useEffect(() => {
    if (open) setDelta("0");
  }, [open]);

  const d = Number(delta);
  const validNumber = delta.trim() !== "" && Number.isInteger(d);
  const newTotal = current + d;
  const wouldGoNegative = validNumber && newTotal < 0;
  const invalid = !validNumber || wouldGoNegative || d === 0;

  const bump = (by: number) => setDelta(String((Number(delta) || 0) + by));

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await api.PUT("/private/stock/{productId}", {
        params: { path: { productId: product?.id ?? "" } },
        body: { delta: d },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Stock ${d > 0 ? "increased" : "reduced"} by ${Math.abs(d)}`);
      void qc.invalidateQueries({ queryKey: ["stock"] });
      void qc.invalidateQueries({ queryKey: ["products"] });
      void qc.invalidateQueries({ queryKey: ["product", product?.id] });
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update stock (maybe not enough to remove)."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Adjust stock" description={product?.name}>
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Current stock: <span className="font-medium">{current}</span>
          </p>
          <div className="space-y-1">
            <Label htmlFor="stock-delta">Adjust by (+ add / − remove)</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => bump(-1)}
              >
                −
              </Button>
              <Input
                id="stock-delta"
                type="number"
                step={1}
                value={delta}
                onChange={(e) => setDelta(e.target.value)}
                aria-invalid={!validNumber || wouldGoNegative ? true : undefined}
                className="text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => bump(1)}
              >
                +
              </Button>
            </div>
            {validNumber && d !== 0 && !wouldGoNegative && (
              <p className="text-xs text-slate-500">
                New total: {current} → <span className="font-medium">{newTotal}</span>
              </p>
            )}
            {wouldGoNegative && (
              <p className="text-xs text-red-600">
                Can't remove {Math.abs(d)} — only {current} in stock.
              </p>
            )}
            {validNumber && newTotal === 0 && d !== 0 && (
              <p className="text-xs text-amber-600">
                This brings stock to 0 (product becomes unsellable).
              </p>
            )}
          </div>
          <p className="text-xs text-slate-400">
            A relative change is applied on top of any in-flight checkout
            reservations, then written through to all stores (D1, KV, R2).
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={invalid || mutation.isPending}
            >
              {mutation.isPending ? "Saving…" : "Apply"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
