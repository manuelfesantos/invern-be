import { config } from "./config";
import { authStore } from "./auth-store";

// Multipart upload — openapi-fetch's typed body is awkward for FormData, so this
// does an authenticated raw POST and returns the hosted image URL.
export async function uploadImageFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const token = authStore.getToken();
  const res = await fetch(`${config.apiBaseUrl}/private/images/upload`, {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    throw new Error("Upload failed");
  }
  const body = (await res.json()) as { data?: { url?: string } };
  if (!body.data?.url) {
    throw new Error("Upload returned no URL");
  }
  return body.data.url;
}
