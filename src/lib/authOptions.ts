import { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";

import DiscordProvider from "next-auth/providers/discord";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { MongoDBAdapter } from "@next-auth/mongodb-adapter";

import { clientPromise } from "~/lib/db/client";
import { getUserProfile } from "~/lib/db/users";

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async signIn({ user }) {
      if (
        process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
        && (!("emailVerified" in user) || !user.emailVerified)
      ) {
        return false;
      }

      const extraProfile = await getUserProfile(user.id);
      if (extraProfile?.banned) return false;

      return true;
    },
    async session({ session, user }) {
      const extraProfile = await getUserProfile(user.id);
      if (!extraProfile) throw new Error("Profile not found");

      return {
        ...session,
        user: { ...session.user, id: user.id },
        extraProfile,
      };
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
};
