"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelarMarcacaoAction } from "./actions";

export default function AcoesMarcacao({ marcacaoId, clienteNovo }: { marcacaoId: string; clienteNovo: boolean }) {
  const router = useRouter();
  const [aGuardar, iniciarTransicao] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function cancelar() {
    const aviso = clienteNovo
      ? "Cancelar esta marcação? Como este cliente ainda não tem mais nenhum histórico, os dados dele (viatura, pedido, tudo) são apagados por completo. Não é possível desfazer."
      : "Cancelar esta marcação? Esta marcação específica é apagada — os dados do cliente mantêm-se. Não é possível desfazer.";
    if (!window.confirm(aviso)) return;

    setErro(null);
    iniciarTransicao(async () => {
      const resultado = await cancelarMarcacaoAction(marcacaoId);
      if (resultado?.erro) setErro(resultado.erro);
      else router.push("/marcacoes");
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={cancelar}
        disabled={aGuardar}
        className="w-full rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700 active:bg-red-100 disabled:opacity-50"
      >
        {aGuardar ? "A cancelar…" : "Cancelar marcação"}
      </button>

      {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
    </div>
  );
}
