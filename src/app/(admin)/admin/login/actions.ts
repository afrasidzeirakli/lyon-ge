"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");
  if (!username || !password) return { error: "შეიყვანე მომხმარებელი და პაროლი" };

  const admin = await prisma.admin.findUnique({ where: { username } });
  // დროის შედარება ყოველთვის ხდება, რომ არსებობა არ გამოჩნდეს
  const ok = admin ? verifyPassword(password, admin.passwordHash) : verifyPassword(password, "00:00");
  if (!admin || !ok) return { error: "მომხმარებელი ან პაროლი არასწორია" };

  await createSession(admin.id);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
