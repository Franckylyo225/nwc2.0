import { site } from "@/content/site";
import { Reveal } from "./Reveal";
import { ArrowUpRight, Button } from "./ui";

const { cta, contact } = site;

export function Cta() {
  return (
    <section id="contact" className="py-24 sm:py-32">
      <div className="shell">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-ink px-8 py-20 text-center text-white sm:px-16 sm:py-28">
            {/* Halo décoratif */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-40 left-1/2 size-[38rem] -translate-x-1/2 rounded-full bg-accent/25 blur-[120px]"
            />

            <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
              <h2 className="display text-5xl sm:text-6xl lg:text-7xl">
                {cta.title}
              </h2>
              <p className="text-lg leading-relaxed text-white/60">
                {cta.subtitle}
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button href={cta.primary.href} variant="secondary">
                  {cta.primary.label}
                  <ArrowUpRight />
                </Button>
                <Button
                  href={cta.secondary.href}
                  variant="ghost"
                  className="px-6 py-3 text-white/70 ring-1 ring-white/15 hover:bg-white/5 hover:text-white"
                >
                  {cta.secondary.label}
                </Button>
              </div>

              <p className="mt-6 text-sm text-white/45">
                Ou directement : {contact.email} · {contact.phone}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
