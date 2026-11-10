import "dotenv/config";
import { db } from "../lib/db";
import { isPrismaActive } from "../lib/prisma";

async function main() {
  console.log("======================================================================");
  console.log("🧹 EstateFlow Clean Slate Initializer");
  console.log("======================================================================");

  const isPostgres = isPrismaActive();
  console.log(`Database Mode: ${isPostgres ? "Supabase / PostgreSQL (Prisma)" : "Local Resilient Store (.estateflow-db.json)"}`);

  console.log("Wiping all demo organizations, sample leads, and demo accounts...");
  await db.cleanSlate();

  const superAdminEmail = (process.env.SUPERADMIN_EMAIL || "kartavyagore0@gmail.com").toLowerCase().trim();
  const superAdmin = await db.findUserByEmail(superAdminEmail);
  const plans = await db.getPlans();
  const orgs = await db.findOrganizations();

  console.log("----------------------------------------------------------------------");
  console.log("✅ WIPE & CLEAN BOOTSTRAP COMPLETE!");
  console.log(`- Subscription Plans Created: ${plans.length} (${plans.map((p) => p.name).join(", ")})`);
  console.log(`- Demo Organizations: ${orgs.length} (Completely Clean Workspace)`);
  console.log(`- Platform Super Admin Account: ${superAdmin?.email || superAdminEmail} (ACTIVE)`);
  console.log("----------------------------------------------------------------------");
  console.log("🚀 You can now sign in at http://localhost:3000/login as Super Admin");
  console.log("   and onboard your first real estate builder organization!");
  console.log("======================================================================");
}

main().catch((err) => {
  console.error("❌ Clean slate failed:", err);
  process.exit(1);
});
