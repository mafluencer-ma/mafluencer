import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: {
      run: "npx ts-node prisma/seed.ts",
    },
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
});
