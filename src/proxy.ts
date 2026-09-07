import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_FILE = /\.[^/]+$/;
const SESSION_COOKIE = "lyon_admin";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ადმინ პანელი: ოპტიმისტური შემოწმება — ქუქის გარეშე login-ზე გადამისამართება.
  // ნამდვილი შემოწმება ბაზაში ხდება admin layout-ში (requireAdmin).
  if (pathname.startsWith("/admin")) {
    if (pathname !== "/admin/login" && !req.cookies.get(SESSION_COOKIE)?.value) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      if (pathname !== "/admin") url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/brand") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // /ka/... -> კანონიკური მისამართი პრეფიქსის გარეშე
  if (pathname === "/ka" || pathname.startsWith("/ka/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/ka/, "") || "/";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return NextResponse.next();
  }

  // ნაგულისხმევი ენა (ქართული): შიდა rewrite /ka/... -ზე, URL უცვლელი რჩება
  const url = req.nextUrl.clone();
  url.pathname = `/ka${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
