import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const ACCESS_COOKIE = "btphub_access";
const REFRESH_COOKIE = "btphub_refresh";
const ACCESS_TTL = "30m";
const REFRESH_TTL = "14d";
const REFRESH_MAX_AGE = 14 * 24 * 60 * 60;

export type Role = "customer" | "provider" | "admin";

export interface SessionUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  customerId?: string;
  providerId?: string;
  neighborhoodId?: string;
}

function secret(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-change-me");
}

export async function signAccessToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user, kind: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(secret());
}

export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ userId, kind: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .sign(secret());
}

export async function verifyToken<T = SessionUser & { kind: string }>(
  token: string,
): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as T;
  } catch {
    return null;
  }
}

export async function setAuthCookies(user: SessionUser): Promise<void> {
  const store = await cookies();
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
  store.set(ACCESS_COOKIE, await signAccessToken(user), opts);
  store.set(REFRESH_COOKIE, await signRefreshToken(user.userId), {
    ...opts,
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

/** Session from the access cookie, refreshed transparently by middleware. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken<SessionUser & { kind: string }>(token);
  if (!payload || payload.kind !== "access") return null;
  return payload;
}

export const cookieNames = { ACCESS_COOKIE, REFRESH_COOKIE };
