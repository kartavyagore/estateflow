import "dotenv/config";
import { testAuth } from "../tests/auth.test";
import { testTenantIsolation } from "../tests/tenant-isolation.test";
import { testLeadEngine } from "../tests/lead-engine.test";
import { testMetaWebhooks } from "../tests/meta-webhooks.test";
import { testAnalyticsAndSubscriptions } from "../tests/analytics-subscriptions.test";

async function runAllTests() {
  console.log("==================================================================");
  console.log("🧪 EstateFlow Automated Test Suite: Verification & Security Audit");
  console.log("==================================================================");

  try {
    await testAuth();
    await testTenantIsolation();
    await testLeadEngine();
    await testMetaWebhooks();
    await testAnalyticsAndSubscriptions();

    console.log("==================================================================");
    console.log("🎉 ALL TESTS PASSED! Multi-tenant security & workflows verified.");
    console.log("==================================================================");
  } catch (err: any) {
    console.error("\n❌ TEST SUITE FAILURE:", err.message);
    process.exit(1);
  }
}

runAllTests();
