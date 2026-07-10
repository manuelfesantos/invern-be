import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button, Dialog, DialogContent } from "./ui";
import { getCroppedWebp } from "../lib/image-processing";

// Square keeps every product image the same shape in grids. Change to taste.
const ASPECT = 1;

export function ImageCropDialog({
  file,
  open,
  onOpenChange,
  onComplete,
}: {
  file: File | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (blob: Blob) => Promise<void> | void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) {
      setSrc(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback(
    (_: Area, pixels: Area) => setArea(pixels),
    [],
  );

  const confirm = async () => {
    if (!src || !area) return;
    setBusy(true);
    try {
      const blob = await getCroppedWebp(src, area);
      await onComplete(blob);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Crop image"
        description="Square crop, saved as compressed WebP (metadata stripped)."
      >
        <div className="space-y-4">
          <div className="relative h-64 w-full overflow-hidden rounded bg-slate-900">
            {src && (
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={ASPECT}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-slate-900"
              aria-label="Zoom"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => void confirm()} disabled={busy || !area}>
              {busy ? "Processing…" : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
