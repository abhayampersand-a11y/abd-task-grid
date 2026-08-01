import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma 7 no longer auto-loads `.env`. Node's built-in loader is enough here.
for (const file of [".env.local", ".env"]) {
  const full = path.join(process.cwd(), file);
  if (fs.existsSync(full)) process.loadEnvFile(full);
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations/introspection use the direct (non-pooled) Neon connection.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
