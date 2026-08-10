"use client";

import { useActionState } from "react";
import { login } from "../actions";

const input =
  "w-full rounded-xl bg-white px-4 py-3 text-sm text-ink ring-1 ring-line transition-shadow focus:outline-none focus:ring-2 focus:ring-accent";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, {});

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {next ? <input type="hidden" name="suite" value={next} /> : null}

      {state.error ? (
        <p
          role="alert"
          className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Adresse e-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={input}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-ink">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={input}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-pill bg-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-50"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
