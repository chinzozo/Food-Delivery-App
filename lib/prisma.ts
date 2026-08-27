import "dotenv/config";
import pg from "pg"; // <-- Заавал pg багцаас pool-ээ оруулж ирэх ёстой
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.NEXT_PUBLIC_DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in .env file");
}

// PrismaPg адаптерт заавал pg.Pool-ийг дамжуулж өгөх ёстой
const pool = new pg.Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});
const adapter = new PrismaPg(pool);

// Global хувьсагч ашиглан хөгжүүлэлтийн явцад хэт олон холболт (Pool connection) үүсэхээс сэргийлнэ
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
