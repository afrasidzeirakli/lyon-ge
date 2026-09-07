import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "./db";

export const SESSION_COOKIE = "lyon_admin";
const SESSION_DAYS = 14;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function cookieIsSecure(): boolean {
  return process.env.NODE_ENV === "production" && (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");
}

export async function createSession(adminId: number): Promise<void> {
  const id = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await prisma.session.create({ data: { id, adminId, expiresAt } });
  // ვადაგასული სესიების გასუფთავება
  await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  const store = await cookies();
  store.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieIsSecure(),
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (id) await prisma.session.deleteMany({ where: { id } });
  store.delete(SESSION_COOKIE);
}

/** მიმდინარე ადმინი (ან null). ერთ რექვესთში ერთხელ იკითხება. */
export const getAdmin = cache(async () => {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  const session = await prisma.session.findUnique({ where: { id }, include: { admin: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.admin;
});

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
