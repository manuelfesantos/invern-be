/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API base URL, e.g. http://localhost:8790 or https://api.invernspirit.com */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
