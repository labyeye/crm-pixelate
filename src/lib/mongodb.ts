import { MongoClient, Db } from "mongodb";

/**
 * Dynamic MongoDB helper
 *
 * - Reads connection info from env: MONGODB_URI (required) and optional MONGODB_DB
 * - Lazily connects and caches the client across module reloads (works in dev/Next.js)
 * - Exposes getMongoClient(), getDb(dbName?), and closeMongoClient()
 */

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "";
const defaultDbFromEnv = process.env.MONGODB_DB || process.env.MONGO_DB;

if (!uri) {
  // don't throw at import time in some environments, but surface a clear error when used
  // Consumers should handle the missing URL or provide it via env.
  // eslint-disable-next-line no-console
  console.warn("MONGODB_URI is not set. MongoDB operations will fail until it's provided.");
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

let client: MongoClient | undefined = (global as any)._mongoClient;
let clientPromise: Promise<MongoClient> | undefined = (global as any)._mongoClientPromise;

function parseDbNameFromUri(connectionString: string | undefined): string | undefined {
  if (!connectionString) return undefined;
  // strip query string
  const withoutQuery = connectionString.split("?")[0];
  // find last slash
  const lastSlash = withoutQuery.lastIndexOf("/");
  if (lastSlash === -1) return undefined;
  const db = withoutQuery.substring(lastSlash + 1);
  return db || undefined;
}

function ensureClientInitialized(): Promise<MongoClient> {
  if (!client) {
    if (!uri) {
      return Promise.reject(new Error("MONGODB_URI is not defined."));
    }

    client = new MongoClient(uri);
    clientPromise = client.connect();

    // Cache on global to survive hot reloads in development
    try {
      (global as any)._mongoClient = client;
      (global as any)._mongoClientPromise = clientPromise;
    } catch (e) {
      // ignore non-writable global in some runtimes
    }
  }

  // clientPromise must be set here
  return clientPromise as Promise<MongoClient>;
}

export async function getMongoClient(): Promise<MongoClient> {
  return ensureClientInitialized();
}

export async function getDb(dbName?: string): Promise<Db> {
  const conn = await ensureClientInitialized();
  // priority: explicit arg -> MONGODB_DB env -> DB parsed from URI -> default 'admin'
  const dbFromUri = parseDbNameFromUri(uri);
  const name = dbName || defaultDbFromEnv || dbFromUri || "admin";
  return conn.db(name);
}

export async function closeMongoClient(): Promise<void> {
  if (!client) return;
  try {
    await client.close();
  } finally {
    client = undefined;
    clientPromise = undefined;
    try {
      (global as any)._mongoClient = undefined;
      (global as any)._mongoClientPromise = undefined;
    } catch (e) {
      // ignore
    }
  }
}

export default getDb;
