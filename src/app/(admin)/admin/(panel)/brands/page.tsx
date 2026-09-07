import Link from "next/link";
import { Plus, Trash } from "lucide-react";
import { prisma } from "@/lib/db";
import { saveBrand, deleteBrand } from "@/lib/admin/actions/taxonomy";
import { Card, Field, PageHeader } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { Notice } from "@/components/admin/Notice";

export const metadata = { title: "ბრენდები" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function BrandsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const editId = Number(sp.edit) || null;
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
  const editing = editId ? brands.find((b) => b.id === editId) ?? null : null;

  return (
    <>
      <PageHeader title="ბრენდები" description="Nike, adidas, New Balance… — ჩანს ფილტრებში და მთავარი გვერდის ბრენდების ზოლში" />
      <Notice params={sp} />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          {brands.length === 0 ? (
            <p className="text-sm text-muted">ბრენდები არ არის.</p>
          ) : (
            <div className="-m-5 overflow-x-auto">
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th>ბრენდი</th>
                    <th>slug</th>
                    <th>პროდუქტი</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          {b.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={b.logoUrl} alt="" className="h-8 w-8 rounded-lg border border-line object-contain" />
                          ) : (
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cream text-[12px] font-semibold">{b.name.slice(0, 2)}</span>
                          )}
                          <span className="font-medium">{b.name}</span>
                        </div>
                      </td>
                      <td className="text-muted">{b.slug}</td>
                      <td className="tabular-nums">{b._count.products}</td>
                      <td className="text-right whitespace-nowrap">
                        <Link href={`/admin/brands?edit=${b.id}`} className="btn btn-outline btn-sm mr-1">
                          რედაქტირება
                        </Link>
                        <form action={deleteBrand} className="inline">
                          <input type="hidden" name="id" value={b.id} />
                          <ConfirmSubmit message={`წავშალო ბრენდი „${b.name}“? პროდუქტები დარჩება ბრენდის გარეშე.`}>
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

        <Card title={editing ? `რედაქტირება: ${editing.name}` : "ახალი ბრენდი"}>
          <form key={editing?.id ?? "new"} action={saveBrand} className="space-y-4">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <Field label="სახელი *">
              <input name="name" defaultValue={editing?.name ?? ""} required className="field" placeholder="Nike" />
            </Field>
            <Field label="slug (URL)" hint="ცარიელი — ავტომატურად">
              <input name="slug" defaultValue={editing?.slug ?? ""} className="field" />
            </Field>
            <ImageField name="logoUrl" label="ლოგო (არასავალდებულო)" defaultValue={editing?.logoUrl ?? ""} aspect="aspect-square" maxSize={600} />
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm">
                <Plus className="h-4 w-4" /> {editing ? "შენახვა" : "დამატება"}
              </button>
              {editing ? (
                <Link href="/admin/brands" className="btn btn-outline btn-sm">
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
