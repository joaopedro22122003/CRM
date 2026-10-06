"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { linkWhatsApp } from "@/lib/whatsapp";
import { mensagemLembreteManutencao } from "@/lib/mensagens";
import { marcarClienteContactadoAction } from "./actions";

export default function BotaoEnviarMensagem({
  clienteId,
  telefone,
  nome,
  carro,
}: {
  clienteId: string;
  telefone: string;
  nome: string;
  carro: string;
}) {
  const router = useRouter();
  const [, iniciarTransicao] = useTransition();

  const link = linkWhatsApp(telefone, mensagemLembreteManutencao(nome, carro));

  function aoClicar() {
    iniciarTransicao(async () => {
      await marcarClienteContactadoAction(clienteId);
      router.refresh();
    });
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={aoClicar}
      className="flex items-center justify-center gap-1.5 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white active:bg-green-700"
    >
      Enviar mensagem
    </a>
  );
}
