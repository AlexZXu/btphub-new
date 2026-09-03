import mongoose from "mongoose";

// Cache the connection (and the optional embedded server) across hot reloads.
const globalForDb = globalThis as unknown as {
  _mongooseConn?: Promise<typeof mongoose>;
};

async function resolveUri(): Promise<string> {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  if (process.env.NODE_ENV === "production") {
    throw new Error("MONGODB_URI must be set in production");
  }
  // Zero-setup dev fallback: embedded MongoDB persisted under .mongo-data/.
  const { MongoMemoryServer } = await import("mongodb-memory-server");
  const { mkdirSync } = await import("node:fs");
  const path = await import("node:path");
  const dbPath = path.join(process.cwd(), ".mongo-data");
  mkdirSync(dbPath, { recursive: true });
  const server = await MongoMemoryServer.create({
    instance: { dbPath, storageEngine: "wiredTiger", port: 27817 },
  });
  return server.getUri("btphub");
}

export async function dbConnect(): Promise<typeof mongoose> {
  if (!globalForDb._mongooseConn) {
    globalForDb._mongooseConn = (async () => {
      const uri = await resolveUri();
      const conn = await mongoose.connect(uri);
      const { seedIfEmpty } = await import("@/lib/seed");
      await seedIfEmpty();
      return conn;
    })();
  }
  return globalForDb._mongooseConn;
}
