/* eslint-disable no-var */

declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_CONN_STRING: string;
    NEXT_PUBLIC_CURSEFORGE_API_KEY: string;

    /** Only available when deployed */
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?: string;
  }
}
