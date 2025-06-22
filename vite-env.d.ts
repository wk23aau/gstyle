
interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string; // Made optional as it might not always be present during development if not configured
  // Add other environment variables used in your application here
  // Example: readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}