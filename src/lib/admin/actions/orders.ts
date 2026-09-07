"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/i18n/dictionaries";

export async function updateOrderStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  if (!Number.isInteger(id) || !(ORDER_STATUSES as readonly string[]).includes(status)) return;

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order || order.status === status) return;

  await prisma.$transaction(async (tx) => {
    // გაუქმებისას მარაგი ბრუნდება; გაუქმებულის აღდგენისას — ისევ აკლდება
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const it of order.items) {
        if (it.productId) await tx.productSize.updateMany({ where: { productId: it.productId, size: it.size }, data: { stock: { increment: it.qty } } });
      }
    } else if (order.status === "cancelled" && status !== "cancelled") {
      for (const it of order.items) {
        if (it.productId) await tx.productSize.updateMany({ where: { productId: it.productId, size: it.size }, data: { stock: { decrement: it.qty } } });
      }
    }
    await tx.order.update({ where: { id }, data: { status } });
  });

  revalidatePath("/admin", "layout");
  redirect(`/admin/orders/${id}?saved=1`);
}

export async function deleteOrder(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) await prisma.order.delete({ where: { id } });
  revalidatePath("/admin", "layout");
  redirect("/admin/orders?deleted=1");
}
