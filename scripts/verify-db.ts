import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter } as never);

async function main() {
  // 1. Super admin check
  const admin = await prisma.user.findUnique({
    where:  { email: "mafluencer.ma@gmail.com" },
    select: { email: true, role: true, banned: true },
  });
  console.log("Super admin:", admin ?? "NOT FOUND");

  // 2. Users by role
  const counts = await prisma.user.groupBy({
    by:     ["role"],
    _count: { _all: true },
  });
  console.log("Users by role:", counts.map((c) => `${c.role}: ${c._count._all}`).join(", ") || "(empty)");

  // 3. Total counts
  const [users, challenges, missions, transactions] = await Promise.all([
    prisma.user.count(),
    prisma.challenge.count(),
    prisma.mission.count(),
    prisma.transaction.count(),
  ]);
  console.log(`Totals — users: ${users}, challenges: ${challenges}, missions: ${missions}, transactions: ${transactions}`);

  // 4. Verify MANAGER enum exists by trying to count MANAGER users
  const managers = await prisma.user.count({ where: { role: "MANAGER" } });
  console.log(`MANAGER users: ${managers} (enum exists ✅)`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("❌ DB verification failed:", e);
  process.exit(1);
});
