"use client";

import { apagarClienteAction } from "./actions";

export default function BotaoApagarClienteX({ clienteId, nome }: { clienteId: string; nome: string }) {
  return (
    <form
      action={apagarClienteAction}
      onSubmit={(evento) => {
        const confirmou = window.confirm(
          `Apagar ${nome}? Isto remove também as viaturas, pedidos, orçamentos, marcações, serviços e faturação deste cliente. Não é possível desfazer.`
        );
        if (!confirmou) evento.preventDefault();
      }}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100"
    >
      <input type="hidden" name="cliente_id" value={clienteId} />
      <button
        type="submit"
        aria-label={`Apagar ${nome}`}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 active:bg-red-100 active:text-red-700"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </form>
  );
}
