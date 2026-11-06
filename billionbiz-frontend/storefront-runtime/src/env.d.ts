/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ROOT_DOMAIN?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly BACKEND_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
