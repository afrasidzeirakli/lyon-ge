import Link from "next/link";
import { Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUSES } from "@/i18n/dictionaries";
import { EmptyState, PageHeader, StatusBadge, formatDate } from "@/components/admin/ui";
import { Notice } from "@/components/admin/Notice";

export const metadata = { title: "შეკვეთები" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const LABELS: Record<string, string> = { all: "ყველა", new: "ახალი", confirmed: "დადასტურებული", shipped: "გზაშია", delivered: "მიწოდებული", cancelled: "გაუქმებული" };

export default async function OrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && (ORDER_STATUSES as readonly string[]).includes(sp.status) ? sp.status : "all";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const where: Prisma.OrderWhereInput = {};
  if (status !== "all") where.status = status;
  if (q) where.OR = [{ number: { contains: q } }, { customerName: { contains: q } }, { phone: { contains: q } }];

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, include: { items: { select: { qty: true } } }, take: 300 }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
  ]);
  const countOf = (s: string) => (s === "all" ? counts.reduce((a, c) => a + c._count, 0) : counts.find((c) => c.status === s)?._count ?? 0);

  return (
    <>
      <PageHeader title="შეკვეთები" description="ახალი შეკვეთები Telegram-შიც მოდის, თუ პარამეტრებში ბოტი ჩართულია" />
      <Notice params={sp} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {["all", ...ORDER_STATUSES].map((s) => (
            <Link key={s} href={`/admin/orders?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`btn btn-sm ${status === s ? "btn-primary" : "btn-outline"}`}>
              {LABELS[s]} <span className="opacity-60">{countOf(s)}</span>
            </Link>
          ))}
        </div>
        <form className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="ნომერი, სახელი, ტელეფონი…" className="field h-10 pl-10 text-sm" />
          {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
        </form>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="შეკვეთები არ არის" description="როცა მომხმარებელი შეკვეთას გააფორმებს, აქ გამოჩნდება." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="admin-table w-full min-w-[760px]">
            <thead>
              <tr>
                <th>№</th>
                <th>მიმღები</th>
                <th>ქალაქი</th>
                <th>ნივთი</th>
                <th>თარიღი</th>
                <th>სტატუსი</th>
                <th className="text-right">ჯამი</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                      {o.number}
                    </Link>
                  </td>
                  <td>
                    {o.customerName}
                    <span className="block text-[12px] text-muted">{o.phone}</span>
                  </td>
                  <td className="text-muted">{o.city}</td>
                  <td className="tabular-nums">{o.items.reduce((a, i) => a + i.qty, 0)}</td>
                  <td className="whitespace-nowrap text-muted">{formatDate(o.createdAt)}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="text-right font-medium tabular-nums">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
