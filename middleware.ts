import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/sell(.*)",
  "/admin(.*)",
  "/c/(.*)/checkout(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isSellerRoute = createRouteMatcher(["/sell(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const { userId, sessionClaims, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn({ returnBackUrl: req.url });

  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;

  if (isAdminRoute(req) && role !== "ADMIN") {
    return Response.redirect(new URL("/", req.url));
  }
  if (isSellerRoute(req) && role !== "SELLER" && role !== "ADMIN") {
    return Response.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
