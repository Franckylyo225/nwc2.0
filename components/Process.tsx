import { site } from "@/content/site";
import { Reveal } from "./Reveal";
import { Section } from "./ui";

const { process } = site;

export function Process() {
  return (
    <Section id="methode" className="bg-ink text-white">
      <Reveal>
        <div className="flex flex-col gap-5">
          <span className="inline-flex w-fit items-center gap-2 rounded-pill bg-white/10 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-accent">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            {process.eyebrow}
          </span>
          <h2 className="display max-w-3xl text-4xl sm:text-5xl lg:text-[3.5rem]">
            {process.title}
          </h2>
          <p className="max-w-xl text-lg leading-relaxed text-white/60">
            {process.intro}
          </p>
        </div>
      </Reveal>

      <ol className="mt-16 grid gap-px overflow-hidden rounded-card bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
        {process.steps.map((step, i) => (
          <Reveal key={step.title} delay={0.07 * i} className="bg-ink">
            <li className="group flex h-full flex-col gap-4 p-8 transition-colors duration-300 hover:bg-white/[0.04]">
              <span className="display text-5xl text-white/15 transition-colors duration-300 group-hover:text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="text-[0.95rem] leading-relaxed text-white/55">
                {step.description}
              </p>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
