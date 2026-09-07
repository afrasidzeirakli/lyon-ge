import Link from "next/link";
import { Plus, Trash } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatPrice, gelInput } from "@/lib/money";
import { PRODUCT_TYPES } from "@/i18n/dictionaries";
import ka from "@/i18n/dictionaries/ka.json";
import { isPromotionLive } from "@/lib/pricing";
import { savePromoCode, deletePromoCode, savePromotion, deletePromotion } from "@/lib/admin/actions/promos";
import { Card, Field, PageHeader, Toggle, formatDate } from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { Notice } from "@/components/admin/Notice";

export const metadata = { title: "აქციები & პრომო კოდები" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const toLocalInput = (d: Date | null) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

export default async function PromosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const editCode = Number(sp.code) || null;
  const editPromo = Number(sp.promo) || null;
  const [codes, promotions, categories, brands] = await Promise.all([
    prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.promotion.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);
  const code = editCode ? codes.find((c) => c.id === editCode) ?? null : null;
  const promo = editPromo ? promotions.find((p) => p.id === editPromo) ?? null : null;
  const types = ka.types as Record<string, string>;
  const now = new Date();

  const scopeLabel = (p: (typeof promotions)[number]) => {
    switch (p.scope) {
      case "all":
        return "ყველა პროდუქტი";
      case "category":
        return `კატეგორია: ${categories.find((c) => c.id === p.categoryId)?.nameKa ?? "?"}`;
      case "brand":
        return `ბრენდი: ${brands.find((b) => b.id === p.brandId)?.name ?? "?"}`;
      case "type":
        return `ტიპი: ${types[p.productType ?? ""] ?? p.productType}`;
      default:
        return p.scope;
    }
  };

  return (
    <>
      <PageHeader title="აქციები & პრომო კოდები" description="აქცია ავტომატურად ამცირებს ფასს საიტზე; პრომო კოდს მყიდველი checkout-ზე წერს" />
      <Notice params={sp} />

      <div className="grid gap-6 xl:grid-cols-2">
        {/* ---------- აქციები ---------- */}
        <div className="space-y-6">
          <Card title="აქციები (ავტომატური ფასდაკლება)">
            {promotions.length === 0 ? (
              <p className="text-sm text-muted">აქციები არ არის.</p>
            ) : (
              <ul className="divide-y divide-line">
                {promotions.map((p) => {
                  const live = isPromotionLive(p, now);
                  return (
                    <li key={p.id} className="flex items-center gap-3 py-3">
                      <span className={`badge ${live ? "bg-success/10 text-success" : "bg-ink/5 text-muted"}`}>{live ? "აქტიური" : "გამორთული"}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {p.titleKa} <span className="text-accent">−{p.percent}%</span>
                        </p>
                        <p className="text-[12px] text-muted">
                          {scopeLabel(p)}
                          {p.startsAt ? ` · ${formatDate(p.startsAt)}` : ""}
                          {p.endsAt ? ` → ${formatDate(p.endsAt)}` : ""}
                        </p>
                      </div>
                      <Link href={`/admin/promos?promo=${p.id}`} className="btn btn-outline btn-sm">
                        რედაქტირება
                      </Link>
                      <form action={deletePromotion}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmSubmit message={`წავშალო აქცია „${p.titleKa}“?`}>
                          <Trash className="h-4 w-4" />
                        </ConfirmSubmit>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title={promo ? `აქციის რედაქტირება: ${promo.titleKa}` : "ახალი აქცია"}>
            <form key={promo?.id ?? "new-promo"} action={savePromotion} className="space-y-4">
              {promo ? <input type="hidden" name="id" value={promo.id} /> : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="სახელი (ქართულად) *" hint="ჩანს პროდუქტის გვერდზე ბეჯად">
                  <input name="titleKa" defaultValue={promo?.titleKa ?? ""} required className="field" placeholder="მაგ. სარბენი მოდელები −15%" />
                </Field>
                <Field label="Title (English)">
                  <input name="titleEn" defaultValue={promo?.titleEn ?? ""} className="field" />
                </Field>
                <Field label="ფასდაკლება (%) *">
                  <input name="percent" type="number" min={1} max={100} defaultValue={promo?.percent ?? 10} required className="field" />
                </Field>
                <Field label="მოქმედების არე">
                  <select name="scope" defaultValue={promo?.scope ?? "all"} className="field">
                    <option value="all">ყველა პროდუქტი</option>
                    <option value="category">კატეგორია</option>
                    <option value="brand">ბრენდი</option>
                    <option value="type">ტიპი</option>
                  </select>
                </Field>
                <Field label="კატეგორია (თუ არე = კატეგორია)">
                  <select name="categoryId" defaultValue={promo?.categoryId ?? ""} className="field">
                    <option value="">—</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameKa}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="ბრენდი (თუ არე = ბრენდი)">
                  <select name="brandId" defaultValue={promo?.brandId ?? ""} className="field">
                    <option value="">—</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="ტიპი (თუ არე = ტიპი)">
                  <select name="productType" defaultValue={promo?.productType ?? ""} className="field">
                    <option value="">—</option>
                    {PRODUCT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {types[t]}
                      </option>
                    ))}
                  </select>
                </Field>
                <div />
                <Field label="დაწყება (არასავალდებულო)">
                  <input name="startsAt" type="datetime-local" defaultValue={toLocalInput(promo?.startsAt ?? null)} className="field" />
                </Field>
                <Field label="დასრულება (არასავალდებულო)">
                  <input name="endsAt" type="datetime-local" defaultValue={toLocalInput(promo?.endsAt ?? null)} className="field" />
                </Field>
              </div>
              <Toggle name="isActive" label="აქტიური" defaultChecked={promo?.isActive ?? true} />
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm">
                  <Plus className="h-4 w-4" /> {promo ? "შენახვა" : "აქციის დამატება"}
                </button>
                {promo ? (
                  <Link href="/admin/promos" className="btn btn-outline btn-sm">
                    გაუქმება
                  </Link>
                ) : null}
              </div>
            </form>
          </Card>
        </div>

        {/* ---------- პრომო კოდები ---------- */}
        <div className="space-y-6">
          <Card title="პრომო კოდები">
            {codes.length === 0 ? (
              <p className="text-sm text-muted">პრომო კოდები არ არის.</p>
            ) : (
              <ul className="divide-y divide-line">
                {codes.map((c) => {
                  const expired = (c.endsAt && c.endsAt < now) || (c.maxUses != null && c.usedCount >= c.maxUses);
                  return (
                    <li key={c.id} className="flex items-center gap-3 py-3">
                      <span className={`badge ${c.isActive && !expired ? "bg-success/10 text-success" : "bg-ink/5 text-muted"}`}>{c.isActive && !expired ? "აქტიური" : expired ? "ვადაგასული" : "გამორთული"}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono font-semibold">{c.code}</p>
                        <p className="text-[12px] text-muted">
                          {c.type === "percent" ? `−${c.value}%` : `−${formatPrice(c.value)}`}
                          {c.minSubtotal > 0 ? ` · მინ. ${formatPrice(c.minSubtotal)}` : ""} · გამოყენებული {c.usedCount}
                          {c.maxUses != null ? `/${c.maxUses}` : ""}
                          {c.endsAt ? ` · ${formatDate(c.endsAt)}-მდე` : ""}
                        </p>
                      </div>
                      <Link href={`/admin/promos?code=${c.id}`} className="btn btn-outline btn-sm">
                        რედაქტირება
                      </Link>
                      <form action={deletePromoCode}>
                        <input type="hidden" name="id" value={c.id} />
                        <ConfirmSubmit message={`წავშალო კოდი ${c.code}?`}>
                          <Trash className="h-4 w-4" />
                        </ConfirmSubmit>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title={code ? `კოდის რედაქტირება: ${code.code}` : "ახალი პრომო კოდი"}>
            <form key={code?.id ?? "new-code"} action={savePromoCode} className="space-y-4">
              {code ? <input type="hidden" name="id" value={code.id} /> : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="კოდი *">
                  <input name="code" defaultValue={code?.code ?? ""} required className="field font-mono uppercase" placeholder="WELCOME10" />
                </Field>
                <Field label="ტიპი">
                  <select name="type" defaultValue={code?.type ?? "percent"} className="field">
                    <option value="percent">პროცენტი (%)</option>
                    <option value="fixed">ფიქსირებული თანხა (₾)</option>
                  </select>
                </Field>
                <Field label="მნიშვნელობა *" hint="პროცენტი ან ლარი ტიპის მიხედვით">
                  <input name="value" defaultValue={code ? (code.type === "percent" ? String(code.value) : gelInput(code.value)) : "10"} required className="field" />
                </Field>
                <Field label="მინ. შეკვეთა (₾)">
                  <input name="minSubtotal" defaultValue={code ? gelInput(code.minSubtotal) : "0"} className="field" />
                </Field>
                <Field label="მაქს. გამოყენება" hint="ცარიელი — შეუზღუდავი">
                  <input name="maxUses" type="number" min={0} defaultValue={code?.maxUses ?? ""} className="field" />
                </Field>
                <div />
                <Field label="დაწყება (არასავალდებულო)">
                  <input name="startsAt" type="datetime-local" defaultValue={toLocalInput(code?.startsAt ?? null)} className="field" />
                </Field>
                <Field label="დასრულება (არასავალდებულო)">
                  <input name="endsAt" type="datetime-local" defaultValue={toLocalInput(code?.endsAt ?? null)} className="field" />
                </Field>
              </div>
              <Toggle name="isActive" label="აქტიური" defaultChecked={code?.isActive ?? true} />
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm">
                  <Plus className="h-4 w-4" /> {code ? "შენახვა" : "კოდის დამატება"}
                </button>
                {code ? (
                  <Link href="/admin/promos" className="btn btn-outline btn-sm">
                    გაუქმება
                  </Link>
                ) : null}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
