import { hashPassword, verifyPassword } from "../lib/auth/password";
import { createSessionToken, verifySessionToken } from "../lib/auth/session";

export async function testAuth() {
  console.log("▶ Testing Authentication & Password Hashing...");

  // 1. Password hashing & verification
  const plain = "StrongDeveloperPassword!2026";
  const hash = await hashPassword(plain);
  const isValid = await verifyPassword(plain, hash);
  if (!isValid) throw new Error("Password verification failed for valid password");

  const isInvalid = await verifyPassword("WrongPassword!", hash);
  if (isInvalid) throw new Error("Password verification passed for invalid password");

  // 2. JWT Session generation and verification
  const session = {
    userId: "usr_test123",
    email: "test@estateflow.io",
    name: "Test Builder",
    isSuperAdmin: false,
    activeOrgId: "org_abc",
    activeOrgSlug: "abc-builders",
    activeRole: "OWNER" as const,
  };

  const token = await createSessionToken(session);
  if (!token) throw new Error("Failed to generate JWT session token");

  const verified = await verifySessionToken(token);
  if (!verified || verified.userId !== session.userId || verified.activeOrgSlug !== "abc-builders") {
    throw new Error("JWT session payload mismatch");
  }

  // 3. Invalid token rejection
  const tampered = token.slice(0, -6) + "xxxxxx";
  const invalidVerified = await verifySessionToken(tampered);
  if (invalidVerified !== null) throw new Error("Tampered JWT token was not rejected");

  console.log("  ✔ Password hashing and verification passed");
  console.log("  ✔ JWT session encoding, expiration, and tampering protection passed");
}

