"use client";

import { useState, useTransition } from "react";
import { marcarPedidoPagoAction } from "./actions";

export default function BotaoPago({
  pedidoId,
  valorSugerido,
  temViatura,
}: {
  pedidoId: string;
  valorSugerido: number | null;
  temViatura: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [valor, setValor] = useState(valorSugerido !== null ? valorSugerido.toFixed(2) : "");
  const [erro, setErro] = useState<string | null>(null);
  const [aGuardar, iniciarTransicao] = useTransition();

  function abrir(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setErro(null);
    setAberto(true);
  }

  function confirmar() {
    const numero = Number(valor.replace(",", "."));
    if (!numero || numero <= 0) {
      setErro("Indica um valor válido.");
      return;
    }
    iniciarTransicao(async () => {
      const resultado = await marcarPedidoPagoAction(pedidoId, numero);
      if (resultado?.erro) {
        setErro(resultado.erro);
        return;
      }
      setAberto(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="rounded-full border border-brand px-3 py-1 text-xs font-semibold text-brand active:bg-brand-50"
      >
        Pago
      </button>

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
            <p className="mt-1 text-sm text-neutral-500">Quanto é que o cliente pagou?</p>

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
                onClick={confirmar}
                disabled={aGuardar || !temViatura}
                className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white active:bg-brand-dark disabled:opacity-50"
              >
                {aGuardar ? "A guardar…" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
