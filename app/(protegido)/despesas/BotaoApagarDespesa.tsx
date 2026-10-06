"use client";

import { apagarDespesaAction } from "./actions";

export default function BotaoApagarDespesa({ despesaId, descricao }: { despesaId: string; descricao: string }) {
  return (
    <form
      action={apagarDespesaAction}
      onSubmit={(evento) => {
        const confirmou = window.confirm(`Apagar a despesa "${descricao}"?`);
        if (!confirmou) evento.preventDefault();
      }}
    >
      <input type="hidden" name="despesa_id" value={despesaId} />
      <button
        type="submit"
        aria-label={`Apagar despesa: ${descricao}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 active:bg-red-50 active:text-red-700"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.8 12.1a2 2 0 0 1-2 1.9H9.8a2 2 0 0 1-2-1.9L7 7h10Z" />
        </svg>
      </button>
    </form>
  );
}
