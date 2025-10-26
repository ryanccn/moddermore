import { MongoClient, type MongoClientOptions, ServerApiVersion } from "mongodb";
import { getVercelOidcToken } from "@vercel/functions/oidc";

import type { ModList, UserProfile } from "~/types/moddermore";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  serverApi: ServerApiVersion.v1,
  authMechanismProperties:
    process.env.NODE_ENV === "production" && process.env.MONGODB_URI.includes("authMechanism=MONGODB-OIDC")
      ? {
          OIDC_CALLBACK: async () => {
            return {
              accessToken: await getVercelOidcToken(),
            };
          },
        }
      : {},
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Please add your MongoDB URI to the environment");
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

const getListsCollection = async () => {
  const client = await clientPromise;
  return client.db().collection<ModList>("lists");
};

const getUsersCollection = async () => {
  const client = await clientPromise;
  return client.db().collection<{ email: string; emailVerified: Date }>("users");
};

const getProfilesCollection = async () => {
  const client = await clientPromise;
  return client.db().collection<UserProfile>("profiles");
};

export { clientPromise, getListsCollection, getProfilesCollection, getUsersCollection };
