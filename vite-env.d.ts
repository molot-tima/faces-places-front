/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_MOCK_API: string;
  readonly VITE_DEV_FAKE_TELEGRAM_USER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
