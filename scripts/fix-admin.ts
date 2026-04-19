/**
 * One-time script: force mafluencer.ma@gmail.com to ADMIN role in DB.
 * Run once: npx tsx scripts/fix-admin.ts
 */
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const pool    = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

async function main() {
  const email = "mafluencer.ma@gmail.com";

  const updated = await prisma.user.update({
    where:  { email },
    data:   { role: "ADMIN" },
    select: { id: true, email: true, role: true },
  });

  console.log("✅ Super admin role fixed:", updated);
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
