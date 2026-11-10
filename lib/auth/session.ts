import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserSession } from "@/lib/types";

const SESSION_COOKIE_NAME = "estateflow_session";
const JWT_SECRET_STRING = process.env.JWT_SECRET || "estateflow-fallback-super-secret-key-32-chars-long";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const SESSION_EXPIRATION = "7d";

export async function createSessionToken(session: UserSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRATION)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      isSuperAdmin: Boolean(payload.isSuperAdmin),
      avatarUrl: (payload.avatarUrl as string) || null,
      activeOrgId: (payload.activeOrgId as string) || null,
      activeOrgSlug: (payload.activeOrgSlug as string) || null,
      activeRole: (payload.activeRole as any) || null,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(session: UserSession): Promise<string> {
  const token = await createSessionToken(session);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
  return token;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

