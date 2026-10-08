"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { marcarJaMarcouAction } from "./actions";

export default function BotaoJaMarcou({ id }: { id: string }) {
  const router = useRouter();
  const [aGuardar, iniciarTransicao] = useTransition();

  function aoClicar() {
    iniciarTransicao(async () => {
      await marcarJaMarcouAction(id);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={aoClicar}
      disabled={aGuardar}
      className="flex-1 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-300 active:bg-brand-100 disabled:opacity-50"
    >
      {aGuardar ? "A guardar…" : "Já marcou"}
    </button>
  );
}
