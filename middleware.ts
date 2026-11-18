// middleware.ts
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const runClerkMiddleware = async (req: NextRequest, event: NextFetchEvent) => {
  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");

  const isPublicRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api(.*)",
  ]);

  const middleware = clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();   // ✅ v6 syntax
    }
  });

  return await middleware(req, event);
};

export default async (req: NextRequest, event: NextFetchEvent) => {
  try {
    return await runClerkMiddleware(req, event);
  } catch (e) {
    console.error("[middleware] Clerk failed:", e);
    return NextResponse.next();
  }
};

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
