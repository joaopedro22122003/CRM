"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { linkWhatsApp } from "@/lib/whatsapp";
import { mensagemOrcamentoSemResposta } from "@/lib/mensagens";
import { marcarSeguimentoAction } from "./actions";

export default function BotaoEnviarMensagem({
  id,
  telefone,
  nome,
  carro,
}: {
  id: string;
  telefone: string;
  nome: string;
  carro: string | null;
}) {
  const router = useRouter();
  const [, iniciarTransicao] = useTransition();

  const link = linkWhatsApp(telefone, mensagemOrcamentoSemResposta(nome, carro));

  function aoClicar() {
    iniciarTransicao(async () => {
      await marcarSeguimentoAction(id);
      router.refresh();
    });
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={aoClicar}
      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white active:bg-green-700"
    >
      Enviar mensagem
    </a>
  );
}
