// Client-side image processing: crop → downscale → re-encode as WebP.
// Re-drawing through a canvas strips all metadata (EXIF/GPS/etc.), and WebP with
// a quality factor gives a much smaller file than the source JPEG/PNG while
// keeping visual quality. Product images don't need to exceed MAX_DIM px.

const MAX_DIM = 1200;
const QUALITY = 0.82;

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

/** Crop `src` to `crop` (natural pixels), downscale to <= MAX_DIM, return WebP. */
export async function getCroppedWebp(
  src: string,
  crop: PixelCrop,
  maxDim = MAX_DIM,
  quality = QUALITY,
): Promise<Blob> {
  const image = await loadImage(src);

  const scale = Math.min(1, maxDim / Math.max(crop.width, crop.height));
  const outW = Math.max(1, Math.round(crop.width * scale));
  const outH = Math.max(1, Math.round(crop.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outW,
    outH,
  );

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encoding failed"))),
      "image/webp",
      quality,
    );
  });
}
