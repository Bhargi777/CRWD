import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

/**
 * Resolves the signed-in Clerk user to our app-level `users` row. Clerk is
 * source of truth for identity/session; this table holds role + profile
 * state used by server actions and route handlers (RULES.md: never trust
 * client input — role checks always run server-side against this row).
 */
export async function getCurrentAppUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  return prisma.user.findUnique({ where: { id: userId } });
}

export async function requireAppUser(): Promise<User> {
  const user = await getCurrentAppUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireRole(role: User["role"]): Promise<User> {
  const user = await requireAppUser();
  if (user.role !== role && user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function getClerkUser() {
  return currentUser();
}
