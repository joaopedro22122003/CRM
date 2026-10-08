"use server";

import { revalidatePath } from "next/cache";
import { criarRegistoOrcamentoSemResposta } from "@/lib/data/orcamentos-sem-resposta";
import { ROTULOS_PACOTE } from "@/lib/types";
import type { Pacote } from "@/lib/types";

export type EstadoPedidoRapido = { erro?: string; sucesso?: boolean };

const PACOTES_VALIDOS: Pacote[] = ["inicial", "detalhe", "completo"];

/** Regista só em orcamentos_sem_resposta — não cria cliente, viatura,
 * pedido nem orçamento (ver migração 0010). */
export async function criarPedidoRapidoAction(
  _estado: EstadoPedidoRapido,
  formData: FormData
): Promise<EstadoPedidoRapido> {
  const telefone = String(formData.get("telefone") ?? "").trim();
  const nome = String(formData.get("nome") ?? "").trim();
  const carro = String(formData.get("carro") ?? "").trim();
  const pacoteBruto = String(formData.get("pacote") ?? "nao_sei");

  if (!telefone) return { erro: "Falta o telemóvel." };
  if (!nome) return { erro: "Falta o nome." };

  const pacote = PACOTES_VALIDOS.includes(pacoteBruto as Pacote) ? ROTULOS_PACOTE[pacoteBruto as Pacote] : null;

  await criarRegistoOrcamentoSemResposta({
    nome,
    telefone,
    carro: carro || null,
    pacote,
  });

  revalidatePath("/orcamentos-sem-resposta");
  revalidatePath("/mais");
  revalidatePath("/estatisticas");

  return { sucesso: true };
}
