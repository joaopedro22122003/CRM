"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  marcarMarcacaoPagaAction,
  cancelarMarcacaoAction,
  reverterParaAgendadoAction,
} from "./actions";
import type { EstadoMarcacao } from "@/lib/types";

export default function AcoesMarcacao({
  marcacaoId,
  estadoAtual,
  valorSugerido,
  temViatura,
}: {
  marcacaoId: string;
  estadoAtual: EstadoMarcacao;
  valorSugerido: number | null;
  temViatura: boolean;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [valor, setValor] = useState(valorSugerido !== null ? valorSugerido.toFixed(2) : "");
  const [aGuardar, iniciarTransicao] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function abrirPago() {
    setErro(null);
    setAberto(true);
  }

  function confirmarPago() {
    const numero = Number(valor.replace(",", "."));
    if (!numero || numero <= 0) {
      setErro("Indica um valor válido.");
      return;
    }
    setErro(null);
    iniciarTransicao(async () => {
      const resultado = await marcarMarcacaoPagaAction(marcacaoId, numero);
      if (resultado?.erro) {
        setErro(resultado.erro);
        return;
      }
      setAberto(false);
      router.refresh();
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
          onClick={abrirPago}
          disabled={aGuardar}
          className={`rounded-xl px-4 py-3 text-center text-sm font-semibold disabled:opacity-50 ${
            estadoAtual === "concluido" ? "bg-brand-50 text-brand-300" : "bg-brand text-white active:bg-brand-dark"
          }`}
        >
          {estadoAtual === "concluido" ? "✓ Pago" : "Pago"}
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

      {erro && !aberto && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
          onClick={() => setAberto(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl bg-neutral-100 p-5 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-neutral-900">Confirmar pagamento</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Marca o serviço como feito hoje e regista quanto o cliente pagou.
            </p>

            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-sm font-medium text-neutral-700">Valor pago (€)</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-base text-neutral-900 focus:border-brand focus:outline-none"
              />
            </label>

            {!temViatura && (
              <p className="mt-2 text-sm text-amber-700">
                Este pedido ainda não tem viatura associada — associa uma antes de confirmar.
              </p>
            )}
            {erro && <p className="mt-2 text-sm text-red-700">{erro}</p>}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="flex-1 rounded-xl bg-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 active:bg-neutral-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarPago}
                disabled={aGuardar || !temViatura}
                className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white active:bg-brand-dark disabled:opacity-50"
              >
                {aGuardar ? "A guardar…" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
