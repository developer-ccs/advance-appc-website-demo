import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value; // readable cookie (not httpOnly)
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isApplicantRoute = pathname.startsWith("/student");

  if (!isAdminRoute && !isApplicantRoute) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    const adminRoles = [
      "admin",
      "super-admin",
      "counsellor",
      "executive",
      "account",
      "hr",
      "issuing-authority",
    ];

    if (isAdminRoute && !adminRoles.includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (isApplicantRoute && role !== "student") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/applicant/:path*"],
};
