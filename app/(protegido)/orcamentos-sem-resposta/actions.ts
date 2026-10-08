"use server";

import { revalidatePath } from "next/cache";
import {
  marcarSeguimentoOrcamentoSemResposta,
  atualizarEstadoOrcamentoSemResposta,
} from "@/lib/data/orcamentos-sem-resposta";

function revalidarTudo() {
  revalidatePath("/orcamentos-sem-resposta");
  revalidatePath("/mais");
  revalidatePath("/estatisticas");
}

export async function marcarSeguimentoAction(id: string): Promise<void> {
  if (!id) return;
  await marcarSeguimentoOrcamentoSemResposta(id);
  revalidarTudo();
}

export async function marcarJaMarcouAction(id: string): Promise<void> {
  if (!id) return;
  await atualizarEstadoOrcamentoSemResposta(id, "marcou");
  revalidarTudo();
}

export async function marcarPerdidoAction(id: string): Promise<void> {
  if (!id) return;
  await atualizarEstadoOrcamentoSemResposta(id, "perdido");
  revalidarTudo();
}
