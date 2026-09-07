"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ImagePlus, LoaderCircle, Plus, Save, Trash, X } from "lucide-react";
import clsx from "clsx";
import type { Brand, Category } from "@prisma/client";
import type { ProductFull } from "@/lib/catalog";
import { PRODUCT_TYPES } from "@/i18n/dictionaries";
import ka from "@/i18n/dictionaries/ka.json";
import { gelInput, toTetri } from "@/lib/money";
import { saveProduct, type ProductInput } from "@/lib/admin/actions/products";
import { uploadFiles } from "./ImageField";
import { Field } from "./ui";

type Img = { url: string; alt: string };
type Color = { nameKa: string; nameEn: string; hex: string };
type Size = { size: string; stock: string };

const SIZE_PRESETS: { label: string; sizes: string[] }[] = [
  { label: "მამაკაცი 40–46", sizes: ["40", "41", "42", "43", "44", "45", "46"] },
  { label: "ქალი 36–41", sizes: ["36", "37", "38", "39", "40", "41"] },
  { label: "ბავშვი 28–35", sizes: ["28", "29", "30", "31", "32", "33", "34", "35"] },
];
const COLOR_PRESETS: Color[] = [
  { nameKa: "თეთრი", nameEn: "White", hex: "#F3F1EC" },
  { nameKa: "შავი", nameEn: "Black", hex: "#111111" },
  { nameKa: "ნაცრისფერი", nameEn: "Grey", hex: "#9A9A9A" },
  { nameKa: "წითელი", nameEn: "Red", hex: "#C8102E" },
  { nameKa: "ლურჯი", nameEn: "Blue", hex: "#2F55D4" },
  { nameKa: "მწვანე", nameEn: "Green", hex: "#2E8B57" },
  { nameKa: "ბეჟი", nameEn: "Beige", hex: "#D9C7A7" },
  { nameKa: "ვარდისფერი", nameEn: "Pink", hex: "#F2B5A7" },
];

type Props = { product: ProductFull | null; categories: Category[]; brands: Brand[] };

export function ProductForm({ product, categories, brands }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [f, setF] = useState({
    nameKa: product?.nameKa ?? "",
    nameEn: product?.nameEn ?? "",
    slug: product?.slug ?? "",
    descriptionKa: product?.descriptionKa ?? "",
    descriptionEn: product?.descriptionEn ?? "",
    brandId: product?.brandId ? String(product.brandId) : "",
    categoryId: product?.categoryId ? String(product.categoryId) : "",
    productType: product?.productType ?? "",
    price: gelInput(product?.price ?? null),
    salePrice: gelInput(product?.salePrice ?? null),
    isNew: product?.isNew ?? false,
    isBestSeller: product?.isBestSeller ?? false,
    isFeatured: product?.isFeatured ?? false,
    isActive: product?.isActive ?? true,
  });
  const [images, setImages] = useState<Img[]>(product?.images.map((i) => ({ url: i.url, alt: i.alt ?? "" })) ?? []);
  const [colors, setColors] = useState<Color[]>(product?.colors.map((c) => ({ nameKa: c.nameKa, nameEn: c.nameEn, hex: c.hex })) ?? []);
  const [sizes, setSizes] = useState<Size[]>(product?.sizes.map((s) => ({ size: s.size, stock: String(s.stock) })) ?? []);
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const types = ka.types as Record<string, string>;

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const saved = await uploadFiles(files);
      setImages((prev) => [...prev, ...saved.map((s) => ({ url: s.url, alt: "" }))]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ატვირთვის შეცდომა");
    } finally {
      setUploading(false);
    }
  };

  const move = (i: number, dir: -1 | 1) =>
    setImages((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const addPreset = (preset: string[]) =>
    setSizes((prev) => {
      const have = new Set(prev.map((s) => s.size));
      return [...prev, ...preset.filter((s) => !have.has(s)).map((size) => ({ size, stock: "0" }))];
    });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const payload: ProductInput = {
      id: product?.id,
      nameKa: f.nameKa,
      nameEn: f.nameEn,
      slug: f.slug,
      descriptionKa: f.descriptionKa,
      descriptionEn: f.descriptionEn,
      brandId: f.brandId ? Number(f.brandId) : null,
      categoryId: f.categoryId ? Number(f.categoryId) : null,
      productType: (f.productType || null) as ProductInput["productType"],
      price: toTetri(f.price),
      salePrice: f.salePrice.trim() ? toTetri(f.salePrice) : null,
      isNew: f.isNew,
      isBestSeller: f.isBestSeller,
      isFeatured: f.isFeatured,
      isActive: f.isActive,
      images,
      colors,
      sizes: sizes.filter((s) => s.size.trim()).map((s) => ({ size: s.size.trim(), stock: Number(s.stock) || 0 })),
    };
    startTransition(async () => {
      const res = await saveProduct(payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (!product) {
        router.push(`/admin/products/${res.id}?created=1`);
      } else {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      }
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="mb-4 font-semibold">ძირითადი ინფორმაცია</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="სახელი (ქართულად) *">
              <input value={f.nameKa} onChange={(e) => set("nameKa", e.target.value)} required className="field" placeholder="მაგ. Nike Air Max 90" />
            </Field>
            <Field label="Name (English)">
              <input value={f.nameEn} onChange={(e) => set("nameEn", e.target.value)} className="field" placeholder="e.g. Nike Air Max 90" />
            </Field>
            <Field label="ბრენდი">
              <select value={f.brandId} onChange={(e) => set("brandId", e.target.value)} className="field">
                <option value="">— არ არის —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="კატეგორია">
              <select value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)} className="field">
                <option value="">— არ არის —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameKa}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="ტიპი">
              <select value={f.productType} onChange={(e) => set("productType", e.target.value)} className="field">
                <option value="">— არ არის —</option>
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {types[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="URL (slug)" hint="ცარიელი დატოვე — ავტომატურად შეიქმნება სახელიდან">
              <input value={f.slug} onChange={(e) => set("slug", e.target.value)} className="field" placeholder="nike-air-max-90" />
            </Field>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="აღწერა (ქართულად)">
              <textarea value={f.descriptionKa} onChange={(e) => set("descriptionKa", e.target.value)} className="field-area" rows={5} />
            </Field>
            <Field label="Description (English)">
              <textarea value={f.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} className="field-area" rows={5} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">ფოტოები</h2>
            <label className={clsx("btn btn-outline btn-sm cursor-pointer", uploading && "opacity-60")}>
              {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} ატვირთვა
              <input type="file" accept="image/*" multiple onChange={onUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          {images.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">ფოტოები არ არის — ატვირთე ერთი ან რამდენიმე (პირველი მთავარია)</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((img, i) => (
                <li key={img.url + i} className="group relative overflow-hidden rounded-xl border border-line bg-cream">
                  <div className="product-media relative aspect-[4/5]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    {i === 0 ? <span className="badge absolute top-2 left-2 bg-ink text-white">მთავარი</span> : null}
                  </div>
                  <div className="flex items-center justify-between gap-1 p-1.5">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-ink/5 disabled:opacity-30" aria-label="წინ">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-ink/5 disabled:opacity-30" aria-label="უკან">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="grid h-8 w-8 place-items-center rounded-lg text-danger hover:bg-danger/10" aria-label="წაშლა">
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex gap-2">
            <input
              placeholder="ან ჩასვი სურათის URL და დააჭირე +"
              className="field h-10 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const v = (e.target as HTMLInputElement).value.trim();
                  if (v) setImages((p) => [...p, { url: v, alt: "" }]);
                  (e.target as HTMLInputElement).value = "";
                }
              }}
              id="img-url-input"
            />
            <button
              type="button"
              className="btn btn-outline h-10 px-4"
              onClick={() => {
                const el = document.getElementById("img-url-input") as HTMLInputElement | null;
                const v = el?.value.trim();
                if (v) setImages((p) => [...p, { url: v, alt: "" }]);
                if (el) el.value = "";
              }}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">ზომები და მარაგი</h2>
            <div className="flex flex-wrap gap-1.5">
              {SIZE_PRESETS.map((p) => (
                <button key={p.label} type="button" onClick={() => addPreset(p.sizes)} className="btn btn-outline h-8 px-3 text-[12px]">
                  + {p.label}
                </button>
              ))}
              <button type="button" onClick={() => setSizes((p) => [...p, { size: "", stock: "0" }])} className="btn btn-outline h-8 px-3 text-[12px]">
                <Plus className="h-3.5 w-3.5" /> ზომა
              </button>
            </div>
          </div>
          {sizes.length === 0 ? (
            <p className="text-sm text-muted">ზომები არ არის — მარაგის გარეშე პროდუქტი „არ არის მარაგში“ იქნება.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sizes.map((s, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-line p-2">
                  <input value={s.size} onChange={(e) => setSizes((p) => p.map((x, j) => (j === i ? { ...x, size: e.target.value } : x)))} placeholder="ზომა" className="field h-9 w-20 text-center text-sm" />
                  <input
                    value={s.stock}
                    inputMode="numeric"
                    onChange={(e) => setSizes((p) => p.map((x, j) => (j === i ? { ...x, stock: e.target.value.replace(/[^\d]/g, "") } : x)))}
                    placeholder="მარაგი"
                    className="field h-9 flex-1 text-sm"
                  />
                  <span className="text-[12px] text-muted">ც.</span>
                  <button type="button" onClick={() => setSizes((p) => p.filter((_, j) => j !== i))} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger" aria-label="წაშლა">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">ფერები</h2>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_PRESETS.map((c) => (
                <button key={c.hex} type="button" onClick={() => setColors((p) => (p.some((x) => x.hex === c.hex) ? p : [...p, c]))} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-2.5 text-[12px] hover:border-ink">
                  <span className="h-3.5 w-3.5 rounded-full border border-ink/10" style={{ backgroundColor: c.hex }} /> {c.nameKa}
                </button>
              ))}
              <button type="button" onClick={() => setColors((p) => [...p, { nameKa: "", nameEn: "", hex: "#888888" }])} className="btn btn-outline h-8 px-3 text-[12px]">
                <Plus className="h-3.5 w-3.5" /> სხვა
              </button>
            </div>
          </div>
          {colors.length === 0 ? (
            <p className="text-sm text-muted">ფერები არ არის (არასავალდებულო).</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {colors.map((c, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-line p-2">
                  <input type="color" value={c.hex} onChange={(e) => setColors((p) => p.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))} className="h-9 w-10 cursor-pointer rounded-lg border border-line bg-white p-0.5" aria-label="ფერი" />
                  <input value={c.nameKa} onChange={(e) => setColors((p) => p.map((x, j) => (j === i ? { ...x, nameKa: e.target.value } : x)))} placeholder="ქართულად" className="field h-9 flex-1 text-sm" />
                  <input value={c.nameEn} onChange={(e) => setColors((p) => p.map((x, j) => (j === i ? { ...x, nameEn: e.target.value } : x)))} placeholder="English" className="field h-9 flex-1 text-sm" />
                  <button type="button" onClick={() => setColors((p) => p.filter((_, j) => j !== i))} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger" aria-label="წაშლა">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-10 xl:self-start">
        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="mb-4 font-semibold">ფასი</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ფასი (₾) *">
              <input value={f.price} onChange={(e) => set("price", e.target.value)} required inputMode="decimal" className="field" placeholder="0" />
            </Field>
            <Field label="ფასდაკლებული (₾)">
              <input value={f.salePrice} onChange={(e) => set("salePrice", e.target.value)} inputMode="decimal" className="field" placeholder="—" />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="mb-4 font-semibold">სტატუსი და ბეჯები</h2>
          <div className="space-y-2">
            {(
              [
                ["isActive", "აქტიური (ჩანს საიტზე)", "გამორთვისას პროდუქტი საიტიდან იმალება"],
                ["isNew", "ახალი", "ჩნდება „ახალი კოლექცია“ სექციაში და NEW ბეჯით"],
                ["isBestSeller", "ბესტსელერი", "ჩნდება „ბესტსელერები“ სექციაში"],
                ["isFeatured", "რჩეული", "მომავალი გამოყენებისთვის"],
              ] as const
            ).map(([key, label, desc]) => (
              <label key={key} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-3 py-2.5 hover:bg-cream/40">
                <input type="checkbox" checked={f[key]} onChange={(e) => set(key, e.target.checked)} className="mt-0.5 h-4.5 w-4.5 accent-ink" />
                <span>
                  <span className="block text-[14px] font-medium">{label}</span>
                  <span className="block text-[12px] text-muted">{desc}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        {error ? <p className="rounded-xl bg-danger/10 px-4 py-3 text-[13px] text-danger">{error}</p> : null}
        {saved ? <p className="rounded-xl bg-success/10 px-4 py-3 text-[13px] text-success">შენახულია ✓</p> : null}

        <button type="submit" disabled={pending || uploading} className="btn btn-primary w-full">
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {product ? "შენახვა" : "პროდუქტის შექმნა"}
        </button>
        {product ? (
          <a href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full">
            საიტზე ნახვა ↗
          </a>
        ) : null}
      </aside>
    </form>
  );
}
