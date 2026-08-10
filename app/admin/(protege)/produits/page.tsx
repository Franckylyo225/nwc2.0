import { removeProduct, toggleProduct } from "@/app/admin/actions";
import { RowActions } from "@/components/admin/RowActions";
import { List, PageHeader, Row } from "@/components/admin/shell";
import { PRODUCT_STATUS_LABELS } from "@/lib/content";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Projets maison"
        description="Vos SaaS et plateformes ouverts au public."
        action={{ href: "/admin/produits/nouveau", label: "Ajouter un produit" }}
      />

      <List empty="Aucun projet maison pour l'instant.">
        {products.map((product) => (
          <Row
            key={product.id}
            title={product.name}
            muted={!product.published}
            meta={
              <>
                <span>{PRODUCT_STATUS_LABELS[product.status]}</span>
                {product.tags.length > 0 ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{product.tags.join(", ")}</span>
                  </>
                ) : null}
              </>
            }
            actions={
              <RowActions
                editHref={`/admin/produits/${product.id}`}
                published={product.published}
                label={product.name}
                onToggle={async () => {
                  "use server";
                  return toggleProduct(product.id);
                }}
                onRemove={async () => {
                  "use server";
                  return removeProduct(product.id);
                }}
              />
            }
          />
        ))}
      </List>
    </>
  );
}
