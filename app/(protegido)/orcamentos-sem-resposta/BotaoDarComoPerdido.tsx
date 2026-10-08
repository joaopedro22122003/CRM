"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ModalConfirmacao from "@/components/ModalConfirmacao";
import { marcarPedidoPerdidoAction } from "./actions";

export default function BotaoDarComoPerdido({ pedidoId }: { pedidoId: string }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [aGuardar, iniciarTransicao] = useTransition();

  function confirmar() {
    iniciarTransicao(async () => {
      await marcarPedidoPerdidoAction(pedidoId);
      setAberto(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex-1 rounded-xl bg-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 active:bg-neutral-300"
      >
        Dar como perdido
      </button>

      {aberto && (
        <ModalConfirmacao
          titulo="Dar este orçamento como perdido?"
          mensagem="Sai desta lista e não volta a aparecer. Não apaga o cliente nem o histórico."
          textoConfirmar="Dar como perdido"
          aProcessar={aGuardar}
          onConfirmar={confirmar}
          onFechar={() => setAberto(false)}
        />
      )}
    </>
  );
}
