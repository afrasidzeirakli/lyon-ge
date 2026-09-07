import Link from "next/link";
import Image from "next/image";
import { Plus, Trash } from "lucide-react";
import { prisma } from "@/lib/db";
import { saveCategory, deleteCategory } from "@/lib/admin/actions/taxonomy";
import { Card, Field, PageHeader } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { Notice } from "@/components/admin/Notice";

export const metadata = { title: "კატეგორიები" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function CategoriesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const editId = Number(sp.edit) || null;
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
  const editing = editId ? categories.find((c) => c.id === editId) ?? null : null;

  return (
    <>
      <PageHeader title="კატეგორიები" description="მამაკაცი / ქალი / ბავშვი და სხვა — ჩანს ნავიგაციასა და ფილტრებში" />
      <Notice params={sp} />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          {categories.length === 0 ? (
            <p className="text-sm text-muted">კატეგორიები არ არის.</p>
          ) : (
            <div className="-m-5 overflow-x-auto">
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th>კატეგორია</th>
                    <th>slug</th>
                    <th>პროდუქტი</th>
                    <th>რიგი</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-line bg-cream">{c.imageUrl ? <Image src={c.imageUrl} alt="" fill sizes="40px" className="object-cover" /> : null}</span>
                          <span>
                            <span className="block font-medium">{c.nameKa}</span>
                            <span className="block text-[12px] text-muted">{c.nameEn}</span>
                          </span>
                        </div>
                      </td>
                      <td className="text-muted">{c.slug}</td>
                      <td className="tabular-nums">{c._count.products}</td>
                      <td className="tabular-nums">{c.sortOrder}</td>
                      <td className="text-right whitespace-nowrap">
                        <Link href={`/admin/categories?edit=${c.id}`} className="btn btn-outline btn-sm mr-1">
                          რედაქტირება
                        </Link>
                        <form action={deleteCategory} className="inline">
                          <input type="hidden" name="id" value={c.id} />
                          <ConfirmSubmit message={`წავშალო კატეგორია „${c.nameKa}“? პროდუქტები დარჩება კატეგორიის გარეშე.`}>
                            <Trash className="h-4 w-4" />
                          </ConfirmSubmit>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title={editing ? `რედაქტირება: ${editing.nameKa}` : "ახალი კატეგორია"}>
          <form key={editing?.id ?? "new"} action={saveCategory} className="space-y-4">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <Field label="სახელი (ქართულად) *">
              <input name="nameKa" defaultValue={editing?.nameKa ?? ""} required className="field" />
            </Field>
            <Field label="Name (English)">
              <input name="nameEn" defaultValue={editing?.nameEn ?? ""} className="field" />
            </Field>
            <Field label="slug (URL)" hint="ცარიელი — ავტომატურად">
              <input name="slug" defaultValue={editing?.slug ?? ""} className="field" />
            </Field>
            <Field label="რიგი">
              <input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} className="field" />
            </Field>
            <ImageField name="imageUrl" label="ფოტო (არასავალდებულო)" defaultValue={editing?.imageUrl ?? ""} maxSize={1200} />
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm">
                <Plus className="h-4 w-4" /> {editing ? "შენახვა" : "დამატება"}
              </button>
              {editing ? (
                <Link href="/admin/categories" className="btn btn-outline btn-sm">
                  გაუქმება
                </Link>
              ) : null}
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
