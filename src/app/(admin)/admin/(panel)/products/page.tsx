import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { toggleProductActive } from "@/lib/admin/actions/products";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { Notice } from "@/components/admin/Notice";

export const metadata = { title: "პროდუქტები" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const filter = typeof sp.filter === "string" ? sp.filter : "all";

  const where: Prisma.ProductWhereInput = {};
  if (q) where.OR = [{ nameKa: { contains: q } }, { nameEn: { contains: q } }, { slug: { contains: q } }, { brand: { name: { contains: q } } }];
  if (filter === "active") where.isActive = true;
  if (filter === "inactive") where.isActive = false;
  if (filter === "lowstock") where.sizes = { some: { stock: { lte: 2 } } };

  const products = await prisma.product.findMany({
    where,
    include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 }, sizes: true },
    orderBy: [{ createdAt: "desc" }],
    take: 300,
  });

  const filters = [
    ["all", "ყველა"],
    ["active", "აქტიური"],
    ["inactive", "გამორთული"],
    ["lowstock", "დაბალი მარაგი"],
  ] as const;

  return (
    <>
      <PageHeader
        title="პროდუქტები"
        description={`${products.length} პროდუქტი`}
        actions={
          <Link href="/admin/products/new" className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4" /> ახალი პროდუქტი
          </Link>
        }
      />
      <Notice params={sp} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="ძებნა სახელით, ბრენდით…" className="field h-10 pl-10 text-sm" />
          {filter !== "all" ? <input type="hidden" name="filter" value={filter} /> : null}
        </form>
        <div className="flex flex-wrap gap-1.5">
          {filters.map(([key, label]) => (
            <Link key={key} href={`/admin/products?filter=${key}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`btn btn-sm ${filter === key ? "btn-primary" : "btn-outline"}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="პროდუქტები ვერ მოიძებნა"
          action={
            <Link href="/admin/products/new" className="btn btn-primary btn-sm">
              დაამატე პირველი პროდუქტი
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="admin-table w-full min-w-[820px]">
            <thead>
              <tr>
                <th>პროდუქტი</th>
                <th>კატეგორია</th>
                <th>ფასი</th>
                <th>მარაგი</th>
                <th>ბეჯები</th>
                <th>სტატუსი</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const stock = p.sizes.reduce((s, x) => s + x.stock, 0);
                return (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                        <span className="product-media relative h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-line">
                          {p.images[0] ? <Image src={p.images[0].url} alt="" fill sizes="48px" className="object-cover" /> : null}
                        </span>
                        <span>
                          <span className="block font-medium hover:underline">{p.nameKa}</span>
                          <span className="block text-[12px] text-muted">
                            {p.brand?.name ?? "—"} · {p.slug}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="text-muted">{p.category?.nameKa ?? "—"}</td>
                    <td className="tabular-nums">
                      {p.salePrice ? (
                        <>
                          <span className="font-medium text-accent">{formatPrice(p.salePrice)}</span> <span className="text-[12px] text-muted line-through">{formatPrice(p.price)}</span>
                        </>
                      ) : (
                        <span className="font-medium">{formatPrice(p.price)}</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${stock === 0 ? "bg-danger/10 text-danger" : stock <= 5 ? "bg-warning/15 text-amber-700" : "bg-success/10 text-success"}`}>{stock} ც.</span>
                    </td>
                    <td className="space-x-1">
                      {p.isNew ? <span className="badge bg-ink text-white">NEW</span> : null}
                      {p.isBestSeller ? <span className="badge bg-cream text-ink">ბესტ</span> : null}
                    </td>
                    <td>
                      <form action={toggleProductActive}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className={`badge ${p.isActive ? "bg-success/10 text-success" : "bg-ink/5 text-muted"}`} title="დააჭირე გადასართავად">
                          {p.isActive ? "აქტიური" : "გამორთული"}
                        </button>
                      </form>
                    </td>
                    <td className="text-right">
                      <Link href={`/admin/products/${p.id}`} className="btn btn-outline btn-sm">
                        რედაქტირება
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
