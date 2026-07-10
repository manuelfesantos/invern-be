import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { uploadImageFile } from "../../lib/api-helpers";
import { Badge, Button, Label, toast } from "../../components/ui";
import { ImageCropDialog } from "../../components/ImageCropDialog";

async function fetchImages(productId: string) {
  const { data, error } = await api.GET("/private/images", {
    params: { query: { productId } },
  });
  if (error) throw error;
  return data.data;
}

export function ProductImages({
  productId,
  productName,
}: {
  productId: string;
  productName?: string;
}) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const { data: images } = useQuery({
    queryKey: ["images", productId],
    queryFn: () => fetchImages(productId),
  });
  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: ["images", productId] });

  const associate = useMutation({
    mutationFn: async (url: string) => {
      const { error } = await api.POST("/private/images", {
        body: {
          url,
          productId,
          alt: productName?.trim() || "Product image",
          isThumbnail: (images?.length ?? 0) === 0,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Image added");
      invalidate();
    },
    onError: () => toast.error("Failed to add image."),
  });

  const setThumb = useMutation({
    mutationFn: async (url: string) => {
      const { error } = await api.PUT("/private/images", {
        body: { url, isThumbnail: true },
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (url: string) => {
      const key = url.split("/").pop() ?? "";
      const { error } = await api.DELETE("/private/images/{key}", {
        params: { path: { key } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Image removed");
      invalidate();
    },
    onError: () => toast.error("Remove failed."),
  });

  // Pick a file → open the crop/compress dialog (don't upload the raw file).
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (file) setPendingFile(file);
  };

  // The dialog returns a cropped, compressed WebP blob → upload + associate.
  const onCropped = async (blob: Blob) => {
    const webp = new File([blob], "image.webp", { type: "image/webp" });
    setUploading(true);
    try {
      const url = await uploadImageFile(webp);
      await associate.mutateAsync(url);
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
      setPendingFile(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label>Images</Label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void onFile(e)}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Upload"}
        </Button>
      </div>
      {images && images.length > 0 ? (
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.url}
              className="overflow-hidden rounded-lg border border-slate-200"
            >
              <img
                src={img.url}
                alt={img.alt ?? ""}
                className="aspect-square w-full bg-slate-100 object-cover"
              />
              <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs">
                {img.isThumbnail ? (
                  <Badge variant="success">Thumb</Badge>
                ) : (
                  <button
                    type="button"
                    className="text-slate-500 hover:underline"
                    onClick={() => img.url && setThumb.mutate(img.url)}
                  >
                    Set thumb
                  </button>
                )}
                <button
                  type="button"
                  className="text-red-600 hover:underline"
                  onClick={() => img.url && remove.mutate(img.url)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-400">No images yet.</p>
      )}

      <ImageCropDialog
        file={pendingFile}
        open={pendingFile !== null}
        onOpenChange={(o) => !o && setPendingFile(null)}
        onComplete={onCropped}
      />
    </div>
  );
}
