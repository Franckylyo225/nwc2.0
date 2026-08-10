import { notFound } from "next/navigation";
import { saveProduct } from "@/app/admin/actions";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { FormShell } from "@/components/admin/shell";
import { prisma } from "@/lib/db";
import { productFields } from "../../fields";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <FormShell title="Modifier le projet maison">
      <ResourceForm
        fields={productFields}
        values={{
          name: product.name,
          slug: product.slug,
          tagline: product.tagline,
          description: product.description,
          status: product.status,
          tags: product.tags,
          href: product.href,
          image: product.image,
          position: product.position,
          published: product.published,
        }}
        action={saveProduct.bind(null, product.id)}
        backHref="/admin/produits"
      />
    </FormShell>
  );
}
