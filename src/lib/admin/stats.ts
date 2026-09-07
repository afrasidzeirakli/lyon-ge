import "server-only";
import { prisma } from "@/lib/db";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function daysAgo(n: number): Date {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - n);
  return d;
}

export async function getDashboardStats() {
  const notCancelled = { status: { not: "cancelled" } };
  const [today, week, month, all, newCount, recentOrders, lowStock, topItems, last14, productCount, activeProductCount] = await Promise.all([
    prisma.order.aggregate({ where: { ...notCancelled, createdAt: { gte: daysAgo(0) } }, _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ where: { ...notCancelled, createdAt: { gte: daysAgo(6) } }, _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ where: { ...notCancelled, createdAt: { gte: daysAgo(29) } }, _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ where: notCancelled, _sum: { total: true }, _count: true }),
    prisma.order.count({ where: { status: "new" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { items: { select: { qty: true } } } }),
    prisma.productSize.findMany({
      where: { stock: { lte: 2 }, product: { isActive: true } },
      include: { product: { select: { id: true, nameKa: true, slug: true } } },
      orderBy: [{ stock: "asc" }],
      take: 12,
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "name"],
      where: { order: notCancelled },
      _sum: { qty: true, lineTotal: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 6,
    }),
    prisma.order.findMany({ where: { ...notCancelled, createdAt: { gte: daysAgo(13) } }, select: { createdAt: true, total: true } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
  ]);

  const days: { date: Date; total: number; count: number }[] = [];
  for (let i = 13; i >= 0; i--) days.push({ date: daysAgo(i), total: 0, count: 0 });
  for (const o of last14) {
    const key = startOfDay(o.createdAt).getTime();
    const bucket = days.find((d) => d.date.getTime() === key);
    if (bucket) {
      bucket.total += o.total;
      bucket.count += 1;
    }
  }

  return {
    today: { total: today._sum.total ?? 0, count: today._count },
    week: { total: week._sum.total ?? 0, count: week._count },
    month: { total: month._sum.total ?? 0, count: month._count },
    all: { total: all._sum.total ?? 0, count: all._count },
    newCount,
    recentOrders,
    lowStock,
    topItems: topItems.map((t) => ({ productId: t.productId, name: t.name, qty: t._sum.qty ?? 0, revenue: t._sum.lineTotal ?? 0 })),
    days,
    productCount,
    activeProductCount,
  };
}
