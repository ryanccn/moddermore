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

      NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL: string;
      LEMON_SQUEEZY_WEBHOOK_SECRET: string;
      LEMON_SQUEEZY_API_KEY: string;

      NEXT_PUBLIC_CURSEFORGE_API_KEY: string;

      PLAUSIBLE_TOKEN?: string;
      DISCORD_WEBHOOK?: string;

      /** Only available when deployed */
      NEXT_PUBLIC_VERCEL_ENV?: 'production' | 'preview' | 'development';
      /** Only available when deployed */
      NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?: string;
    }
  }
}

export {};
