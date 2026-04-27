import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = [
  {
    pathPrefix: "/admin",
    requiredRoles: ["admin", "user", "pharmacyAdmin", "pharmacyEmployee", "labAdmin", "specialist", "consultant", "superAdmin"],
  },
  {
    pathPrefix: "/admin/products",
    requiredRoles: ["admin", "pharmacyAdmin", "pharmacyEmployee", "superAdmin"],
  },
  {
    pathPrefix: "/admin/orders",
    requiredRoles: ["admin", "pharmacyAdmin", "pharmacyEmployee", "user", "superAdmin"],
  },
  {
    pathPrefix: "/admin/medical-tourism",
    requiredRoles: ["admin", "consultant", "superAdmin"],
  },
  {
    pathPrefix: "/superuser",
    requiredRoles: ["superuser", "admin", "superAdmin"],
  },
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Geo-restriction: Only allow Ireland (IE)
  // Dev/Debug bypass
  const isDev = process.env.NODE_ENV === 'development';
  const isDebug = process.env.NEXT_PUBLIC_DEBUG === 'true';

  if (!isDev && !isDebug) {
    const country = req.geo?.country || 'IE';
    if (country !== 'IE' && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.startsWith('/auth')) {
       return new NextResponse('Access restricted to Ireland only.', { status: 403 });
    }
  }

  const token = await getToken({ req });

  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/unauthorized" ||
    pathname === "/admin/profile-under-review"
  ) {
    return NextResponse.next();
  }

  for (const route of protectedRoutes) {
    if (pathname.startsWith(route.pathPrefix)) {
      // First: check role access
      if (!token || !route.requiredRoles.includes(token?.role)) {
        const url = req.nextUrl.clone();
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }

      // Second: check if specialist and not approved
      if (
        token.role === "specialist" &&
        !(token.approvalStatus === "approved") &&
        pathname.startsWith("/admin") && // Make sure we're only on /admin
        pathname !== "/admin/profile-under-review" // Avoid infinite redirect loop
      ) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin/profile-under-review";
        return NextResponse.redirect(url);
      }

      // Third: user health questions check
      // if (
      //   token.role === "user" &&
      //   pathname.startsWith("/admin") &&
      //   !token.isHealthQuestionsAnswered
      // ) {
      //   const url = req.nextUrl.clone();
      //   url.pathname = "/health-questions";
      //   return NextResponse.redirect(url);
      // }
    }
  }

  return NextResponse.next();
}
