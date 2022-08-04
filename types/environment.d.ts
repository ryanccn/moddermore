declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    SUPABASE_SERVER_KEY?: string;
    NEXT_PUBLIC_CURSEFORGE_API_KEY?: string;

    /** Only available when deployed */
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?: string;
  }
}
