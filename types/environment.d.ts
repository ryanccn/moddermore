declare namespace NodeJS {
  interface ProcessEnv {
    SUPABASE_URL?: string;
    SUPABASE_KEY?: string;
    NEXT_PUBLIC_CURSEFORGE_API_KEY?: string;

    /** Only available when deployed */
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?: string;
  }
}
