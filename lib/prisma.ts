import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient | null };

function createPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  try {
    const pool = new Pool({
      connectionString,
      ssl: connectionString.includes("supabase.co") || connectionString.includes("pooler.supabase.com")
        ? { rejectUnauthorized: false }
        : undefined,
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } catch (err) {
    console.warn("Could not initialize Prisma adapter:", err);
    return null;
  }
}

export const prisma =
  globalForPrisma.prisma !== undefined ? globalForPrisma.prisma : createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export function isPrismaActive(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  if (url.includes("localhost:5432") || url.includes("127.0.0.1:5432")) {
    return false;
  }
  return !!prisma;
}
