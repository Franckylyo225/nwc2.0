"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { sendMessage } from "@/app/(site)/actions";
import { site } from "@/content/site";
import { HONEYPOT_FIELD, RENDERED_AT_FIELD } from "@/lib/schemas";
import { cx } from "./ui";

const { form } = site.contact;

/**
 * Formulaire de contact.
 *
 * La validation qui fait autorité est celle du serveur : le navigateur ne
 * porte que `required` et `type="email"`, un premier tri qui évite un
 * aller-retour sur les erreurs évidentes. Tout le reste — bornes, listes de
 * choix, pièges anti-robots — est revérifié dans l'action.
 *
 * Sans JavaScript le formulaire part quand même : c'est une Server Action
 * posée sur `action`, donc une soumission HTML ordinaire. Seul l'horodatage
 * anti-robot manque alors, et l'action en tient compte.
 */
export function ContactForm() {
  /* Remonter le formulaire est la façon la plus sûre de repartir de zéro :
     `useActionState` conserve son état tant que le composant vit. */
  const [attempt, setAttempt] = useState(0);

  return (
    <ContactFormFields
      key={attempt}
      onReset={() => setAttempt((value) => value + 1)}
    />
  );
}

function ContactFormFields({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(sendMessage, {});
  const renderedAt = useRef<HTMLInputElement>(null);
  const confirmation = useRef<HTMLDivElement>(null);

  /* Horodatage d'affichage, posé après le rendu : le calculer pendant
     l'exécution du composant donnerait deux valeurs différentes sur le serveur
     et dans le navigateur, et l'hydratation échouerait. */
  useEffect(() => {
    if (renderedAt.current) renderedAt.current.value = String(Date.now());
  }, []);

  /* Le formulaire disparaît au profit de la confirmation : sans déplacer le
     focus, il resterait sur un bouton qui n'existe plus. */
  useEffect(() => {
    if (state.ok) confirmation.current?.focus();
  }, [state.ok]);

  if (state.ok) {
    return (
      <div
        ref={confirmation}
        tabIndex={-1}
        className="flex flex-col items-start gap-4 focus:outline-none"
      >
        <span
          aria-hidden
          className="grid size-12 place-items-center rounded-full bg-accent-soft text-accent"
        >
          <svg viewBox="0 0 16 16" fill="none" className="size-6">
            <path
              d="m3.5 8.5 3 3 6-7"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h3 className="display text-2xl text-ink">{form.successTitle}</h3>
        <p className="leading-relaxed text-muted">{form.successBody}</p>
        <button
          type="button"
          onClick={onReset}
          className="mt-2 text-sm font-medium text-accent underline underline-offset-4"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    /* `relative` sert au seul champ piège, positionné hors écran : sans
       ancrage, il se placerait par rapport à la page et pourrait l'élargir. */
    <form action={formAction} className="relative flex flex-col gap-5">
      <h3 className="display text-2xl text-ink">{form.title}</h3>

      {state.error ? (
        <p
          role="alert"
          className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent ring-1 ring-accent/20"
        >
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom" name="name" error={state.fieldErrors?.name} required>
          {(props) => <input {...props} type="text" autoComplete="name" />}
        </Field>

        <Field label="E-mail" name="email" error={state.fieldErrors?.email} required>
          {(props) => <input {...props} type="email" autoComplete="email" />}
        </Field>

        <Field label="Entreprise" name="company" error={state.fieldErrors?.company}>
          {(props) => <input {...props} type="text" autoComplete="organization" />}
        </Field>

        <Field label="Téléphone" name="phone" error={state.fieldErrors?.phone}>
          {(props) => <input {...props} type="tel" autoComplete="tel" />}
        </Field>

        <Field
          label="Type de projet"
          name="projectType"
          error={state.fieldErrors?.projectType}
        >
          {(props) => <Choices {...props} options={form.projectTypes} />}
        </Field>

        <Field label="Budget" name="budget" error={state.fieldErrors?.budget}>
          {(props) => <Choices {...props} options={form.budgets} />}
        </Field>
      </div>

      <Field label="Votre projet" name="body" error={state.fieldErrors?.body} required>
        {(props) => (
          <textarea
            {...props}
            rows={5}
            placeholder="Ce que vous voulez construire, pour qui, et pour quand."
          />
        )}
      </Field>

      {/* Piège : invisible à l'écran, ignoré du clavier et des lecteurs
          d'écran, mais bien présent dans le HTML que lisent les robots. */}
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

      <div className="mt-1 flex flex-col gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-pill bg-ink px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Envoi en cours…" : form.submit}
        </button>

        <p className="text-xs leading-relaxed text-muted">
          {form.privacy}{" "}
          <Link
            href="/confidentialite"
            className="underline underline-offset-2 hover:text-accent"
          >
            Politique de confidentialité
          </Link>
          .
        </p>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------------ */

/** Attributs communs à toutes les commandes, posés par `Field`. */
type ControlProps = {
  id: string;
  name: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  className: string;
};

/**
 * Étiquette, commande et message d'erreur d'un champ.
 *
 * La commande est fournie par l'appelant plutôt que déduite d'un type : les
 * six champs n'ont ni le même élément ni le même `autoComplete`, et une
 * énumération de cas coûterait plus qu'elle ne rapporte ici.
 */
function Field({
  label,
  name,
  error,
  required,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  children: (props: ControlProps) => ReactNode;
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required ? (
          <span aria-hidden className="text-accent">
            {" "}
            *
          </span>
        ) : (
          <span className="font-normal text-muted"> (facultatif)</span>
        )}
      </label>

      {children({
        id,
        name,
        required,
        "aria-describedby": error ? `${id}-error` : undefined,
        "aria-invalid": error ? true : undefined,
        className: cx(
          "w-full rounded-xl bg-surface px-4 py-3 text-sm text-ink ring-1 transition-shadow placeholder:text-muted/60 focus:outline-none focus:ring-2",
          error ? "ring-accent" : "ring-line focus:ring-accent",
        ),
      })}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Liste déroulante facultative : la première option vaut « non renseigné ». */
function Choices({
  options,
  ...props
}: ControlProps & { options: readonly string[] }) {
  return (
    <select {...props} defaultValue="">
      <option value="">À préciser</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
