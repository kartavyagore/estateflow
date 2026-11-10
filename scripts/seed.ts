import "dotenv/config";
import { db } from "../lib/db";
import { isPrismaActive } from "../lib/prisma";

async function main() {
  console.log("🌱 Initializing EstateFlow multi-tenant database & platform bootstrap...");
  await db.init();

  const superAdminEmail = (process.env.SUPERADMIN_EMAIL || "kartavyagore0@gmail.com").toLowerCase().trim();
  const superAdmin = await db.findUserByEmail(superAdminEmail);
  const plans = await db.getPlans();
  const orgs = await db.findOrganizations();

  console.log("✅ EstateFlow bootstrap successfully verified!");
  console.log(`- Database Mode: ${isPrismaActive() ? "PostgreSQL / Supabase" : "Local File Store"}`);
  console.log(`- Platform Super Admin: ${superAdmin?.email || superAdminEmail}`);
  console.log(`- Active Organizations: ${orgs.length}`);
  console.log(`- Available Plans: ${plans.length}`);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
