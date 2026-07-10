import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  toast,
} from "../../components/ui";

async function fetchCountries() {
  const { data, error } = await api.GET("/private/countries", {
    params: { query: { page: 1, pageSize: 100 } },
  });
  if (error) throw error;
  return data.data?.data ?? [];
}

export function RateCountriesDialog({
  open,
  onOpenChange,
  methodId,
  rateId,
  current,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  methodId: string;
  rateId: string;
  current: string[];
}) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: countries } = useQuery({
    queryKey: ["countries", "all"],
    enabled: open,
    queryFn: fetchCountries,
  });

  useEffect(() => {
    if (open) setSelected(new Set(current));
  }, [open, current]);

  const toggle = (code: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const mutation = useMutation({
    mutationFn: async () => {
      // Replace semantics — send the full set.
      const { error } = await api.PUT(
        "/private/shipping/methods/{methodId}/rates/{rateId}/countries",
        {
          params: { path: { methodId, rateId } },
          body: { countryCodes: [...selected] },
        },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Countries updated");
      void qc.invalidateQueries({ queryKey: ["shipping-methods"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Something went wrong."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Rate countries"
        description="Which countries this weight-band rate applies to at checkout."
      >
        <div className="space-y-3">
          <div className="max-h-60 space-y-1 overflow-auto">
            {countries?.map((c) => (
              <label
                key={c.code}
                className="flex items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Checkbox
                  checked={selected.has(c.code ?? "")}
                  onCheckedChange={() => toggle(c.code ?? "")}
                />
                <span className="font-mono text-xs text-slate-500">
                  {c.code}
                </span>
                {c.name}
              </label>
            ))}
          </div>
          {selected.size === 0 && (
            <p className="text-xs text-amber-600">
              No countries selected — this rate won't be offered at checkout.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
