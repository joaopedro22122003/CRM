"use client";

import { useState, useTransition } from "react";
import { apagarClienteAction } from "./actions";
import ModalConfirmacao from "@/components/ModalConfirmacao";

export default function BotaoApagarCliente({ clienteId, nome }: { clienteId: string; nome: string }) {
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
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="w-full rounded-xl bg-red-50 px-4 py-3 text-center text-base font-semibold text-red-700 active:bg-red-100"
      >
        Apagar cliente
      </button>

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
