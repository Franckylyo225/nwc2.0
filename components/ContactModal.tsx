"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { sendMessage } from "@/app/(site)/actions";
import { site } from "@/content/site";
import { HONEYPOT_FIELD, RENDERED_AT_FIELD } from "@/lib/schemas";
import { cx } from "./ui";

const { flow } = site.contact;

/**
 * Parcours de contact — trois questions dans une modale plein écran.
 *
 * Le formulaire d'un seul tenant demandait sept champs d'un coup, dont deux
 * listes déroulantes ; posées une à une, les mêmes questions se répondent en
 * trois clics et deux saisies. Rien n'est tapé avant la dernière étape.
 *
 * L'envoi passe par la même Server Action que l'ancien formulaire : la demande
 * atterrit dans la rubrique « Messages » de l'administration, et les pièges
 * anti-robots continuent de s'appliquer.
 */

/** Réponses collectées, dans l'ordre où elles sont demandées. */
type Answers = {
  /** Identifiants des besoins cochés — sélection multiple. */
  services: string[];
  autreService: string;
  envergure: string;
  contactMethod: string;
  contactValue: string;
  nom: string;
};

const EMPTY: Answers = {
  services: [],
  autreService: "",
  envergure: "",
  contactMethod: "",
  contactValue: "",
  nom: "",
};

const STEPS = 3;

export function ContactModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  /** Sens du dernier déplacement : il décide du côté d'où l'étape arrive. */
  const [forward, setForward] = useState(true);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [state, formAction, pending] = useActionState(sendMessage, {});

  const dialog = useRef<HTMLDivElement>(null);
  const renderedAt = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) =>
    setAnswers((previous) => ({ ...previous, [key]: value }));

  const go = (next: number) => {
    setForward(next > step);
    setStep(next);
  };

  /* Horodatage anti-robot, posé après le rendu : le calculer pendant
     l'exécution donnerait deux valeurs et casserait l'hydratation. */
  useEffect(() => {
    if (renderedAt.current) renderedAt.current.value = String(Date.now());
  }, []);

  /* Le focus entre dans la modale, et l'arrière-plan cesse de défiler. */
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  /**
   * Échap ferme, et la tabulation reste enfermée dans la modale.
   *
   * Sans ce piège, la tabulation sortirait vers la page restée derrière —
   * invisible mais toujours focalisable, ce qui perd complètement un visiteur
   * au clavier ou au lecteur d'écran.
   */
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== "Tab" || !dialog.current) return;

    const focusable = dialog.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === dialog.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const wantsOther = answers.services.includes("autre");
  const channel = flow.channels.find((c) => c.id === answers.contactMethod);

  const canContinue = [
    answers.services.length > 0 && (!wantsOther || answers.autreService.trim() !== ""),
    answers.envergure !== "",
    answers.nom.trim() !== "" && answers.contactValue.trim() !== "",
  ];

  return (
    <div
      /* Le voile capte le clic hors panneau. Il ne porte pas de rôle : le
         dialogue en dessous est ce que la technologie d'assistance annonce. */
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-shell-bg/95 [animation:fade-in_0.25s_var(--ease-smooth)_both] backdrop-blur-sm"
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col bg-shell-bg px-5 py-6 text-white outline-none [animation:shell-in_0.3s_var(--ease-smooth)_both] sm:px-8 sm:py-8"
      >
        <header className="flex items-center gap-6">
          {state.ok ? (
            <span className="flex-1" />
          ) : (
            <Progress step={step} />
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid size-10 shrink-0 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-4">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        {state.ok ? (
          <Confirmation channel={channel?.label ?? ""} onClose={onClose} />
        ) : (
          <form
            action={formAction}
            className="flex flex-1 flex-col justify-center py-10"
          >
            {/* Toutes les réponses, y compris celles saisies à l'écran : les
                champs visibles sont pilotés par React et n'ont pas de `name`,
                ils ne partent donc pas d'eux-mêmes. Le parcours tient en trois
                écrans, l'envoi en une seule requête. */}
            <input type="hidden" name="name" value={answers.nom} />
            <input type="hidden" name="services" value={answers.services.join(",")} />
            <input type="hidden" name="scope" value={answers.envergure} />
            <input type="hidden" name="preferredContact" value={answers.contactMethod} />
            <input type="hidden" name="body" value={answers.autreService} />
            <input
              type="hidden"
              name="email"
              value={answers.contactMethod === "email" ? answers.contactValue : ""}
            />
            <input
              type="hidden"
              name="phone"
              value={answers.contactMethod === "whatsapp" ? answers.contactValue : ""}
            />

            {/* Pièges anti-robots, identiques à ceux de l'ancien formulaire. */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor={HONEYPOT_FIELD}>Votre site web</label>
              <input
                id={HONEYPOT_FIELD}
                type="text"
                name={HONEYPOT_FIELD}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <input ref={renderedAt} type="hidden" name={RENDERED_AT_FIELD} />

            {state.error ? (
              <p
                role="alert"
                className="mx-auto mb-8 max-w-lg rounded-xl bg-shell-accent/15 px-4 py-3 text-center text-sm text-shell-accent ring-1 ring-shell-accent/30"
              >
                {state.error}
              </p>
            ) : null}

            {/* Remonter à chaque changement d'étape rejoue l'animation
                d'arrivée : c'est elle qui dit qu'on avance ou qu'on revient. */}
            <div
              key={step}
              className={cx(
                "flex flex-col gap-10",
                forward
                  ? "[animation:step-forward_0.35s_var(--ease-smooth)_both]"
                  : "[animation:step-back_0.35s_var(--ease-smooth)_both]",
              )}
            >
              {step === 0 ? (
                <NeedsStep
                  titleId={titleId}
                  answers={answers}
                  set={set}
                  error={state.fieldErrors?.services ?? state.fieldErrors?.body}
                />
              ) : step === 1 ? (
                <ScopeStep
                  titleId={titleId}
                  answers={answers}
                  set={set}
                  error={state.fieldErrors?.scope}
                />
              ) : (
                <ContactStep
                  titleId={titleId}
                  answers={answers}
                  set={set}
                  error={
                    state.fieldErrors?.contactValue ??
                    state.fieldErrors?.email ??
                    state.fieldErrors?.phone ??
                    state.fieldErrors?.name
                  }
                />
              )}

              <Controls
                step={step}
                canContinue={canContinue[step]}
                pending={pending}
                onBack={() => go(step - 1)}
                onNext={() => go(step + 1)}
              />
            </div>
          </form>
        )}

        <footer className="mt-auto pt-6 text-center text-xs text-white/35">
          {flow.privacy}{" "}
          <Link
            href="/confidentialite"
            className="underline underline-offset-2 hover:text-white/60"
          >
            Politique de confidentialité
          </Link>
        </footer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Étapes */

type StepProps = {
  titleId: string;
  answers: Answers;
  set: <K extends keyof Answers>(key: K, value: Answers[K]) => void;
  error?: string;
};

function NeedsStep({ titleId, answers, set, error }: StepProps) {
  const toggle = (id: string) =>
    set(
      "services",
      answers.services.includes(id)
        ? answers.services.filter((value) => value !== id)
        : [...answers.services, id],
    );

  return (
    <div className="flex flex-col gap-8">
      <Title id={titleId} hint={flow.needsHint}>
        {flow.needsTitle}
      </Title>

      <div className="grid gap-3 sm:grid-cols-2">
        {flow.services.map((service) => (
          <Card
            key={service.id}
            type="checkbox"
            checked={answers.services.includes(service.id)}
            onChange={() => toggle(service.id)}
            label={service.label}
            hint={service.hint}
          />
        ))}
      </div>

      {answers.services.includes("autre") ? (
        <Field
          label="Précisez"
          value={answers.autreService}
          onChange={(value) => set("autreService", value)}
          placeholder={flow.otherPlaceholder}
          multiline
          autoFocus
        />
      ) : null}

      <ErrorLine>{error}</ErrorLine>
    </div>
  );
}

/**
 * Étape 2 — l'envergure, dite dans les termes de l'étape 1.
 *
 * « Petit » ne veut pas dire la même chose pour un site et pour un logo :
 * chaque besoin reformule donc les trois envergures. Au-delà de deux besoins
 * cochés, on retombe sur les formulations génériques — empiler quatre
 * précisions ferait un pavé, et un projet qui coche tout est de toute façon
 * composite.
 */
function ScopeStep({ titleId, answers, set, error }: StepProps) {
  const chosen = flow.services.filter((service) =>
    answers.services.includes(service.id),
  );
  const tailored = chosen.length > 0 && chosen.length <= 2;

  const hintFor = (scope: (typeof flow.scopes)[number]) =>
    tailored
      ? chosen.map((service) => service.scopes[scope.id]).join(" · ")
      : scope.hint;

  return (
    <div className="flex flex-col gap-8">
      <Title
        id={titleId}
        /* Rappelle ce qui vient d'être coché : sans ce report, rien ne dit que
           la question tient compte de l'étape précédente. */
        hint={
          chosen.length > 0
            ? `${flow.scopeFor} ${chosen.map((service) => service.label).join(" · ")}`
            : undefined
        }
      >
        {flow.scopeTitle}
      </Title>

      <div
        role="radiogroup"
        aria-label={flow.scopeTitle}
        className="grid gap-3 sm:grid-cols-3"
      >
        {flow.scopes.map((scope) => (
          <Card
            key={scope.id}
            type="radio"
            checked={answers.envergure === scope.id}
            onChange={() => set("envergure", scope.id)}
            label={scope.label}
            hint={hintFor(scope)}
          />
        ))}
      </div>

      <ErrorLine>{error}</ErrorLine>
    </div>
  );
}

function ContactStep({ titleId, answers, set, error }: StepProps) {
  const channel = flow.channels.find((c) => c.id === answers.contactMethod);

  return (
    <div className="flex flex-col gap-8">
      <Title id={titleId}>{flow.contactTitle}</Title>

      <Field
        label="Votre nom"
        value={answers.nom}
        onChange={(value) => set("nom", value)}
        placeholder={flow.namePlaceholder}
        autoComplete="name"
      />

      <div
        role="radiogroup"
        aria-label={flow.contactTitle}
        className="grid gap-3 sm:grid-cols-2"
      >
        {flow.channels.map((option) => (
          <Card
            key={option.id}
            type="radio"
            checked={answers.contactMethod === option.id}
            /* Changer de canal vide la coordonnée : un numéro laissé dans le
               champ e-mail serait envoyé comme adresse. */
            onChange={() => {
              set("contactMethod", option.id);
              set("contactValue", "");
            }}
            label={option.label}
            hint={option.hint}
          />
        ))}
      </div>

      {channel ? (
        <Field
          key={channel.id}
          label={channel.field}
          value={answers.contactValue}
          onChange={(value) => set("contactValue", value)}
          placeholder={channel.placeholder}
          type={channel.id === "email" ? "email" : "tel"}
          autoComplete={channel.id === "email" ? "email" : "tel"}
          autoFocus
        />
      ) : null}

      <ErrorLine>{error}</ErrorLine>
    </div>
  );
}

/* ------------------------------------------------------------ Confirmation */

function Confirmation({ channel, onClose }: { channel: string; onClose: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);

  /* Le formulaire a disparu : sans ce déplacement, le focus resterait sur un
     bouton démonté et la confirmation ne serait pas annoncée. */
  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
      <span
        aria-hidden
        className="grid size-24 place-items-center rounded-full bg-shell-accent/15 ring-1 ring-shell-accent/40 [animation:check-pop_0.5s_var(--ease-smooth)_both]"
      >
        <svg viewBox="0 0 32 32" fill="none" className="size-12">
          <path
            d="M9 16.5 14 21.5 23 11"
            stroke="var(--color-shell-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            /* Le tracé se dessine après que le cercle s'est posé. */
            strokeDasharray="24"
            className="[animation:check-draw_0.4s_var(--ease-smooth)_0.35s_both]"
          />
        </svg>
      </span>

      <h2
        ref={heading}
        tabIndex={-1}
        className="display max-w-lg text-3xl outline-none sm:text-4xl"
      >
        {flow.doneTitle}
      </h2>

      <p className="max-w-md leading-relaxed text-white/55">
        {flow.doneBody.replace("{canal}", channel)}
      </p>

      <button
        type="button"
        onClick={onClose}
        className="mt-4 rounded-pill bg-shell-accent px-8 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        {flow.close}
      </button>
    </div>
  );
}

/* --------------------------------------------------------------- Briques */

function Progress({ step }: { step: number }) {
  return (
    <div className="flex flex-1 items-center gap-2">
      {Array.from({ length: STEPS }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className="h-1 flex-1 overflow-hidden rounded-pill bg-white/10"
        >
          <span
            className={cx(
              "block h-full rounded-pill bg-shell-accent transition-[width] duration-500 ease-smooth",
              i <= step ? "w-full" : "w-0",
            )}
          />
        </span>
      ))}
      <span className="sr-only">
        Étape {step + 1} sur {STEPS}
      </span>
    </div>
  );
}

function Title({
  id,
  hint,
  children,
}: {
  id: string;
  hint?: string;
  children: string;
}) {
  return (
    <div className="flex flex-col gap-2 text-center">
      <h2 id={id} className="display text-3xl sm:text-4xl lg:text-5xl">
        {children}
      </h2>
      {hint ? <p className="text-sm text-white/45">{hint}</p> : null}
    </div>
  );
}

/**
 * Carte de choix.
 *
 * Rien d'illustré : le choix se lit dans la typographie. Le libellé est posé
 * dans la police d'affichage, à une taille qui en fait le sujet de la carte, et
 * la précision en dessous, plus petite et plus grise, tient le rôle qu'aurait
 * eu une icône — donner du corps sans rien répéter.
 *
 * L'état sélectionné se dit trois fois plutôt qu'une : bordure et halo rose,
 * fond plus clair, et le libellé qui passe à l'accent. Un pictogramme de coche
 * serait redondant, et ramènerait l'icône par la fenêtre.
 *
 * L'élément de formulaire est un vrai `input`, masqué visuellement mais bien
 * présent : le navigateur fournit alors gratuitement la sémantique — case ou
 * bouton radio annoncé, groupe parcouru aux flèches, Espace qui coche. Un
 * `<button role="radio">` aurait exigé de réécrire tout cela à la main.
 *
 * Les `input` n'ont pas de `name` : ils ne partent pas avec le formulaire,
 * dont les valeurs sont portées par les champs cachés de la modale.
 */
function Card({
  type,
  checked,
  onChange,
  label,
  hint,
}: {
  type: "checkbox" | "radio";
  checked: boolean;
  onChange: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <label
      className={cx(
        "flex cursor-pointer flex-col gap-1.5 rounded-xl border px-5 py-6 transition-all duration-300 ease-smooth hover:scale-[1.02]",
        /* `focus-within` reporte sur la carte le halo de l'input masqué :
           sans cela, un visiteur au clavier ne verrait pas où il se trouve. */
        "focus-within:border-shell-accent focus-within:ring-2 focus-within:ring-shell-accent/40",
        checked
          ? "border-shell-accent bg-shell-card-active shadow-[0_0_0_1px_var(--color-shell-accent),0_12px_40px_-20px_var(--color-shell-accent)]"
          : "border-shell-line bg-shell-card hover:border-shell-accent/40 hover:shadow-[0_12px_40px_-24px_var(--color-shell-accent)]",
      )}
    >
      <input
        type={type}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={cx(
          "display text-xl leading-tight transition-colors duration-300 sm:text-2xl",
          checked ? "text-shell-accent" : "text-white",
        )}
      >
        {label}
      </span>
      {hint ? (
        <span className="text-sm leading-snug text-white/45">{hint}</span>
      ) : null}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  multiline,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  multiline?: boolean;
  autoFocus?: boolean;
}) {
  const id = useId();
  const base =
    "w-full rounded-xl border border-shell-line bg-shell-card px-4 py-3.5 text-white placeholder:text-white/30 transition-colors focus:border-shell-accent focus:outline-none";

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-2">
      <label htmlFor={id} className="text-sm text-white/55">
        {label}
      </label>

      {multiline ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          autoFocus={autoFocus}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={base}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={base}
        />
      )}
    </div>
  );
}

function ErrorLine({ children }: { children?: string }) {
  if (!children) return null;

  return (
    <p role="alert" className="text-center text-sm text-shell-accent">
      {children}
    </p>
  );
}

function Controls({
  step,
  canContinue,
  pending,
  onBack,
  onNext,
}: {
  step: number;
  canContinue: boolean;
  pending: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const isLast = step === STEPS - 1;

  return (
    <div className="flex items-center justify-center gap-3">
      {step > 0 ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-pill px-6 py-3.5 text-sm text-white/70 transition-colors hover:text-white"
        >
          ← {flow.back}
        </button>
      ) : null}

      <button
        type={isLast ? "submit" : "button"}
        onClick={isLast ? undefined : onNext}
        disabled={!canContinue || pending}
        className={cx(
          "rounded-pill bg-shell-accent px-8 py-3.5 text-sm font-medium text-white transition-all duration-300 ease-smooth",
          "disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35",
          /* La respiration ne s'allume qu'au dernier pas, une fois tout
             renseigné : c'est le seul moment où elle dit quelque chose. */
          isLast &&
            canContinue &&
            !pending &&
            "[animation:soft-pulse_2s_ease-in-out_infinite]",
        )}
      >
        {pending ? "Envoi en cours…" : isLast ? `${flow.submit} →` : `${flow.next} →`}
      </button>
    </div>
  );
}
