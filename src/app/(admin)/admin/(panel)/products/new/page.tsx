import { prisma } from "@/lib/db";
import { BackLink, PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "ახალი პროდუქტი" };

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([prisma.category.findMany({ orderBy: { sortOrder: "asc" } }), prisma.brand.findMany({ orderBy: { name: "asc" } })]);
  return (
    <>
      <BackLink href="/admin/products" label="პროდუქტები" />
      <PageHeader title="ახალი პროდუქტი" />
      <ProductForm product={null} categories={categories} brands={brands} />
    </>
  );
}
