import pkgPrisma from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkgPg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { PrismaClient } = pkgPrisma;
const { Pool } = pkgPg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL env variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({ adapter });
  }
  prisma = global.prisma;
}

export default prisma;
