declare global {
  declare namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;

      GITHUB_CLIENT_ID: string;
      GITHUB_CLIENT_SECRET: string;
      DISCORD_CLIENT_ID: string;
      DISCORD_CLIENT_SECRET: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;

      EMAIL_SERVER: string;
      EMAIL_FROM: string;

      NEXT_PUBLIC_CURSEFORGE_API_KEY: string;

      PLAUSIBLE_TOKEN: string;

      /** Only available when deployed */
      NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?: string;
    }
  }
}

export {};
