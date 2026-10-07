"use client";

/** Janela de confirmação consistente para ações destrutivas (apagar,
 * cancelar) — em vez do alerta genérico do telemóvel. */
export default function ModalConfirmacao({
  titulo,
  mensagem,
  textoConfirmar = "Apagar",
  aProcessar = false,
  onConfirmar,
  onFechar,
}: {
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  aProcessar?: boolean;
  onConfirmar: () => void;
  onFechar: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-sm rounded-t-2xl bg-neutral-100 p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-neutral-900">{titulo}</h2>
        <p className="mt-1 text-sm text-neutral-500">{mensagem}</p>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onFechar}
            className="flex-1 rounded-xl bg-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 active:bg-neutral-300"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={aProcessar}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white active:bg-red-700 disabled:opacity-50"
          >
            {aProcessar ? "A apagar…" : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
