import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg-worker";
import { Pool } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as { _prisma?: InstanceType<typeof PrismaClient> };

export function getDb(): InstanceType<typeof PrismaClient> {
  if (!globalForPrisma._prisma) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    globalForPrisma._prisma = new (PrismaClient as any)({ adapter });
  }
  return globalForPrisma._prisma!;
}

export const prisma = new Proxy({} as InstanceType<typeof PrismaClient>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});
