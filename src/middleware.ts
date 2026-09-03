import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_PREFIXES = ["/home", "/admin"];

function secret(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-change-me");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("btphub_access")?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret());
      const role = payload.role as string;
      // Keep each role inside its own area.
      if (pathname.startsWith("/home/customer") && role !== "customer") {
        return NextResponse.redirect(new URL(`/home/${role === "provider" ? "provider" : "customer"}`, req.url));
      }
      if (pathname.startsWith("/home/provider") && role !== "provider") {
        return NextResponse.redirect(new URL(role === "customer" ? "/home/customer" : "/", req.url));
      }
      return NextResponse.next();
    } catch {
      // fall through to login redirect
    }
  }
  const login = new URL("/login", req.url);
  login.searchParams.set("from", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/home/:path*", "/admin/:path*"],
};
