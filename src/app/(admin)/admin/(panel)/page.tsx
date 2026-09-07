import Link from "next/link";
import { ArrowUpRight, Package, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { getDashboardStats } from "@/lib/admin/stats";
import { formatPrice } from "@/lib/money";
import { Card, PageHeader, StatusBadge, formatDate, formatDay } from "@/components/admin/ui";

export const metadata = { title: "დაშბორდი" };

export default async function DashboardPage() {
  const s = await getDashboardStats();
  const maxDay = Math.max(1, ...s.days.map((d) => d.total));

  const stats = [
    { label: "დღეს", value: formatPrice(s.today.total), sub: `${s.today.count} შეკვეთა`, icon: Wallet },
    { label: "ბოლო 7 დღე", value: formatPrice(s.week.total), sub: `${s.week.count} შეკვეთა`, icon: TrendingUp },
    { label: "ბოლო 30 დღე", value: formatPrice(s.month.total), sub: `${s.month.count} შეკვეთა`, icon: ShoppingCart },
    { label: "პროდუქტები", value: String(s.activeProductCount), sub: `${s.productCount} სულ`, icon: Package },
  ];

  return (
    <>
      <PageHeader
        title="დაშბორდი"
        description={s.newCount > 0 ? `${s.newCount} ახალი შეკვეთა ელოდება დადასტურებას` : "ახალი შეკვეთები არ არის"}
        actions={
          <Link href="/admin/products/new" className="btn btn-primary btn-sm">
            + ახალი პროდუქტი
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((st) => (
          <div key={st.label} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[12px] font-semibold tracking-[0.14em] uppercase">{st.label}</span>
              <st.icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums">{st.value}</p>
            <p className="text-[13px] text-muted">{st.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card title="გაყიდვები — ბოლო 14 დღე" description={`სულ: ${formatPrice(s.days.reduce((a, d) => a + d.total, 0))}`}>
          <div className="flex h-48 gap-1.5 sm:gap-2">
            {s.days.map((d) => (
              <div key={d.date.toISOString()} className="group flex h-full flex-1 flex-col items-center gap-2" title={`${formatDay(d.date)}: ${formatPrice(d.total)} (${d.count})`}>
                <div className="flex min-h-0 w-full flex-1 items-end">
                  <div className={`w-full rounded-t-md transition ${d.total > 0 ? "bg-ink group-hover:bg-accent" : "bg-line"}`} style={{ height: `${d.total > 0 ? Math.max(4, Math.round((d.total / maxDay) * 100)) : 2}%` }} />
                </div>
                <span className="text-[10px] text-muted tabular-nums">{d.date.getDate()}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="ტოპ პროდუქტები" description="გაყიდული რაოდენობით">
          {s.topItems.length === 0 ? (
            <p className="text-sm text-muted">ჯერ არ არის გაყიდვები.</p>
          ) : (
            <ol className="space-y-3">
              {s.topItems.map((t, i) => (
                <li key={`${t.productId}-${t.name}`} className="flex items-center gap-3 text-[14px]">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cream text-[12px] font-semibold">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{t.productId ? <Link href={`/admin/products/${t.productId}`} className="hover:underline">{t.name}</Link> : t.name}</span>
                  <span className="text-muted tabular-nums">{t.qty} ც.</span>
                  <span className="font-medium tabular-nums">{formatPrice(t.revenue)}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card title="ბოლო შეკვეთები">
          {s.recentOrders.length === 0 ? (
            <p className="text-sm text-muted">შეკვეთები ჯერ არ არის.</p>
          ) : (
            <div className="-mx-5 -my-5 overflow-x-auto">
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>მიმღები</th>
                    <th>თარიღი</th>
                    <th>სტატუსი</th>
                    <th className="text-right">ჯამი</th>
                  </tr>
                </thead>
                <tbody>
                  {s.recentOrders.map((o) => (
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
        </Card>

        <Card title="დაბალი მარაგი" description="ზომები, რომლებიც ≤ 2 ცალია">
          {s.lowStock.length === 0 ? (
            <p className="text-sm text-muted">ყველაფერი მარაგშია.</p>
          ) : (
            <ul className="space-y-2">
              {s.lowStock.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 text-[14px]">
                  <Link href={`/admin/products/${r.product.id}`} className="min-w-0 flex-1 truncate hover:underline">
                    {r.product.nameKa} <span className="text-muted">· {r.size}</span>
                  </Link>
                  <span className={r.stock === 0 ? "badge bg-danger/10 text-danger" : "badge bg-warning/15 text-amber-700"}>{r.stock === 0 ? "ამოწურულია" : `${r.stock} ც.`}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
