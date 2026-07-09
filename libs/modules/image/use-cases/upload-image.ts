import { imageClient, ALLOWED_IMAGE_CONTENT_TYPES } from "@r2-adapter";
import { errors } from "@error-handling-utils";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates an uploaded image (content-type allow-list + size limit — never
 * trusts the client filename) and stores it in R2, returning the hosted URL.
 * The URL is then associated with a product/collection via `POST /private/images`.
 */
export const uploadImage = async (file: unknown): Promise<{ url: string }> => {
  if (!(file instanceof File)) {
    throw errors.INVALID_IMAGE_UPLOAD("no file provided");
  }
  if (!ALLOWED_IMAGE_CONTENT_TYPES.includes(file.type)) {
    throw errors.INVALID_IMAGE_UPLOAD(`unsupported content type: ${file.type}`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw errors.INVALID_IMAGE_UPLOAD("file exceeds the 5MB limit");
  }
  if (file.size === 0) {
    throw errors.INVALID_IMAGE_UPLOAD("file is empty");
  }

  const url = await imageClient.upload(await file.arrayBuffer(), file.type);
  return { url };
};
