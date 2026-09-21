"use client";

import { apagarClienteAction } from "./actions";

export default function BotaoApagarCliente({ clienteId, nome }: { clienteId: string; nome: string }) {
  return (
    <form
      action={apagarClienteAction}
      onSubmit={(evento) => {
        const confirmou = window.confirm(
          `Apagar ${nome}? Isto remove também as viaturas, pedidos, orçamentos, marcações, serviços e faturação deste cliente. Não é possível desfazer.`
        );
        if (!confirmou) evento.preventDefault();
      }}
    >
      <input type="hidden" name="cliente_id" value={clienteId} />
      <button
        type="submit"
        className="w-full rounded-xl bg-red-50 px-4 py-3 text-center text-base font-semibold text-red-700 active:bg-red-100"
      >
        Apagar cliente
      </button>
    </form>
  );
}
