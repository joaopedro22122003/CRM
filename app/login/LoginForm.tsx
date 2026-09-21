"use client";

import { useActionState } from "react";
import { entrar, type EstadoLogin } from "./actions";

const ESTADO_INICIAL: EstadoLogin = {};

export default function LoginForm() {
  const [estado, formAction, aPendente] = useActionState(entrar, ESTADO_INICIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-neutral-700">
          Palavra-passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          required
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-lg focus:border-neutral-900 focus:outline-none"
        />
      </div>

      {estado?.erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{estado.erro}</p>
      )}

      <button
        type="submit"
        disabled={aPendente}
        className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-lg font-semibold text-white active:bg-neutral-700 disabled:opacity-50"
      >
        {aPendente ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}
