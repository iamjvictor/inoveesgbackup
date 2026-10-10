import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("inoveesg_token")?.value;
  const { pathname } = request.nextUrl;

  const isAppPage = pathname.startsWith("/app");

  if (isAppPage) {
    if (!token) {
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("auth", "true");
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*", 
    "/app"
  ],
};
