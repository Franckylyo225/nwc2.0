import { About } from "@/components/About";
import { Cta } from "@/components/Cta";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { LatestArticles } from "@/components/LatestArticles";
import { Nav } from "@/components/Nav";
import { Process } from "@/components/Process";
import { Products } from "@/components/Products";
import { Services } from "@/components/Services";
import { Testimonials } from "@/components/Testimonials";
import { TrustedBy } from "@/components/TrustedBy";
import { Works } from "@/components/Works";
import type { Metadata } from "next";
import {
  getArticles,
  getProducts,
  getServices,
  getTestimonials,
  getWorks,
} from "@/lib/content";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/* Les contenus viennent de la base : la page se régénère à chaque publication
   depuis l'admin (revalidatePath), sinon elle est servie depuis le cache. */
export const revalidate = 3600;

export default async function Home() {
  /* Tout est chargé en parallèle : une section lente ne retarde pas les autres. */
  const [services, works, testimonials, products, articles, settings] =
    await Promise.all([
      getServices(),
      getWorks(),
      getTestimonials(),
      getProducts(),
      getArticles({ limit: 3 }),
      getSettings(),
    ]);

  return (
    <>
      <Nav />
      <main id="contenu">
        <Hero images={settings.heroImages} />
        <TrustedBy />
        <Services items={services} />
        <Works items={works} />
        <Testimonials items={testimonials} />
        <About />
        <Process />
        <Products items={products} />
        <LatestArticles items={articles} />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
