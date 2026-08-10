import Image from "next/image";
import { site } from "@/content/site";
import type { ProductItem } from "@/lib/content";
import { Reveal } from "./Reveal";
import { ArrowUpRight, Button, Section, SectionHeading, cx } from "./ui";

const { products } = site;

/** Dégradés utilisés quand aucune capture d'écran n'est fournie. */
const placeholders = [
  "from-accent/30 via-accent/8 to-surface",
  "from-ink/20 via-surface-2 to-surface",
  "from-accent/15 via-surface-2 to-surface",
];

export function Products({ items }: { items: ProductItem[] }) {
  if (items.length === 0) return null;

  return (
    <Section id="produits">
      <Reveal>
        <SectionHeading
          eyebrow={products.eyebrow}
          title={products.title}
          intro={products.intro}
          align="center"
          className="mx-auto"
        />
      </Reveal>

      <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product, i) => (
          <Reveal key={product.id} delay={0.07 * i}>
            <li className="group flex h-full flex-col overflow-hidden rounded-card bg-white ring-1 ring-line transition-all duration-300 ease-smooth hover:shadow-[0_28px_64px_-40px_rgba(16,17,20,0.45)] hover:ring-line-strong">
              {/* Aperçu du produit */}
              <div className="relative aspect-16/10 overflow-hidden border-b border-line">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
                  />
                ) : (
                  <div
                    className={cx(
                      "grid h-full w-full place-items-center bg-gradient-to-br",
                      placeholders[i % placeholders.length],
                    )}
                  >
                    <span className="display text-5xl text-ink/20">
                      {initial(product.name)}
                    </span>
                  </div>
                )}

                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-pill bg-white/90 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur-sm ring-1 ring-line">
                  <span
                    aria-hidden
                    className={cx(
                      "size-1.5 rounded-full",
                      product.status === "En ligne" ? "bg-accent" : "bg-muted",
                    )}
                  />
                  {product.status}
                </span>
              </div>

              {/* Contenu */}
              <div className="flex flex-1 flex-col p-7">
                <h3 className="display text-3xl text-ink">{product.name}</h3>
                <p className="mt-2 text-sm font-medium text-accent">
                  {product.tagline}
                </p>
                <p className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-muted">
                  {product.description}
                </p>

                {product.tags.length > 0 ? (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-pill bg-surface px-3 py-1 text-xs text-muted"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {/* Lien externe : les URL de produits sortent du site. */}
                <a
                  href={product.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-7 inline-flex items-center gap-2 border-t border-line pt-6 text-sm font-medium text-ink transition-colors hover:text-accent"
                >
                  Découvrir le produit
                  <ArrowUpRight className="transition-transform duration-300 ease-smooth group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </li>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={0.1}>
        <div className="mt-14 flex flex-col items-center gap-5 text-center">
          <p className="text-muted">{products.note}</p>
          <Button href={products.cta.href}>
            {products.cta.label}
            <ArrowUpRight />
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}

/** Première lettre significative du nom, pour le visuel de remplacement. */
function initial(name: string) {
  const letters = name.replace(/[^A-Za-zÀ-ÿ]/g, "");
  return letters.slice(0, 2).toUpperCase() || "NWC";
}
