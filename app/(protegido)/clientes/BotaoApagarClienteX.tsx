"use client";

import { useState, useTransition } from "react";
import { apagarClienteAction } from "./actions";
import ModalConfirmacao from "@/components/ModalConfirmacao";

export default function BotaoApagarClienteX({ clienteId, nome }: { clienteId: string; nome: string }) {
  const [aberto, setAberto] = useState(false);
  const [aGuardar, iniciarTransicao] = useTransition();

  function confirmar() {
    iniciarTransicao(async () => {
      const dados = new FormData();
      dados.set("cliente_id", clienteId);
      await apagarClienteAction(dados);
    });
  }

  return (
    <>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label={`Apagar ${nome}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 active:bg-red-100 active:text-red-700"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* Fora do wrapper com opacidade controlada por hover — se não,
         o diálogo desapareceria ao tirar o rato de cima da linha. */}
      {aberto && (
        <ModalConfirmacao
          titulo={`Apagar ${nome}?`}
          mensagem="Isto remove também as viaturas, pedidos, orçamentos, marcações, serviços e faturação deste cliente. Não é possível desfazer."
          aProcessar={aGuardar}
          onConfirmar={confirmar}
          onFechar={() => setAberto(false)}
        />
      )}
    </>
  );
}
