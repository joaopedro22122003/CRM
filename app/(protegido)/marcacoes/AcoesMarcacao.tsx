"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  marcarServicoFeitoAction,
  cancelarMarcacaoAction,
  reverterParaAgendadoAction,
} from "./actions";
import type { EstadoMarcacao } from "@/lib/types";

export default function AcoesMarcacao({
  marcacaoId,
  estadoAtual,
}: {
  marcacaoId: string;
  estadoAtual: EstadoMarcacao;
}) {
  const router = useRouter();
  const [aGuardar, iniciarTransicao] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function marcarFeito() {
    setErro(null);
    iniciarTransicao(async () => {
      const resultado = await marcarServicoFeitoAction(marcacaoId);
      if (resultado?.erro) setErro(resultado.erro);
      else router.refresh();
    });
  }

  function cancelar() {
    if (!window.confirm("Cancelar esta marcação?")) return;
    setErro(null);
    iniciarTransicao(async () => {
      const resultado = await cancelarMarcacaoAction(marcacaoId);
      if (resultado?.erro) setErro(resultado.erro);
      else router.refresh();
    });
  }

  function reverter() {
    setErro(null);
    iniciarTransicao(async () => {
      const resultado = await reverterParaAgendadoAction(marcacaoId);
      if (resultado?.erro) setErro(resultado.erro);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={marcarFeito}
          disabled={aGuardar}
          className={`rounded-xl px-4 py-3 text-center text-sm font-semibold disabled:opacity-50 ${
            estadoAtual === "concluido" ? "bg-brand-50 text-brand-300" : "bg-brand text-white active:bg-brand-dark"
          }`}
        >
          {estadoAtual === "concluido" ? "✓ Serviço feito" : "Serviço feito"}
        </button>
        <button
          type="button"
          onClick={cancelar}
          disabled={aGuardar}
          className={`rounded-xl px-4 py-3 text-center text-sm font-semibold disabled:opacity-50 ${
            estadoAtual === "cancelado" ? "bg-red-100 text-red-700" : "bg-red-50 text-red-700 active:bg-red-100"
          }`}
        >
          {estadoAtual === "cancelado" ? "✓ Cancelado" : "Cancelado"}
        </button>
      </div>

      {estadoAtual !== "agendado" && (
        <button
          type="button"
          onClick={reverter}
          disabled={aGuardar}
          className="self-center text-xs text-neutral-400 underline disabled:opacity-50"
        >
          Reverter para agendado
        </button>
      )}

      {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
    </div>
  );
}
