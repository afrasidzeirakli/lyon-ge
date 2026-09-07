import { notFound } from "next/navigation";
import { Trash } from "lucide-react";
import { prisma } from "@/lib/db";
import { productInclude } from "@/lib/catalog";
import { deleteProduct } from "@/lib/admin/actions/products";
import { BackLink, PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { Notice } from "@/components/admin/Notice";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function EditProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId }, include: productInclude }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <BackLink href="/admin/products" label="პროდუქტები" />
      <PageHeader
        title={product.nameKa}
        description={`ID ${product.id} · ${product.slug}`}
        actions={
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={product.id} />
            <ConfirmSubmit message={`წავშალო „${product.nameKa}“? ეს ქმედება შეუქცევადია.`}>
              <Trash className="h-4 w-4" /> წაშლა
            </ConfirmSubmit>
          </form>
        }
      />
      <Notice params={sp} />
      <ProductForm product={product} categories={categories} brands={brands} />
    </>
  );
}
