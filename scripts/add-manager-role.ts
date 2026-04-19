import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter } as never);

async function main() {
  // 1. Add MANAGER to the Role enum (idempotent)
  try {
    await prisma.$executeRaw`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MANAGER'`;
    console.log("✅ MANAGER role added to DB enum");
  } catch (e) {
    console.log("Note (enum):", e);
  }

  // 2. Ensure super admin is ADMIN in DB
  const updated = await prisma.user.updateMany({
    where: { email: "mafluencer.ma@gmail.com" },
    data:  { role: "ADMIN" },
  });
  console.log(`✅ Super admin updated: ${updated.count} row(s) set to ADMIN`);

  // 3. Verify
  const user = await prisma.user.findUnique({
    where:  { email: "mafluencer.ma@gmail.com" },
    select: { email: true, role: true },
  });
  console.log("✅ Verified:", user);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});
