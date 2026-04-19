/**
 * One-time script: force mafluencer.ma@gmail.com to ADMIN role.
 * Run: npx tsx scripts/set-admin.ts
 */
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const pool    = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.user.updateMany({
    where: { email: "mafluencer.ma@gmail.com" },
    data:  { role: "ADMIN" },
  });
  console.log("Updated:", result.count, "user(s) to ADMIN");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
