"use server";

import { revalidatePath } from "next/cache";
import { marcarPedidoSeguido, atualizarEstadoPedido } from "@/lib/data/pedidos";

function revalidarTudo() {
  revalidatePath("/orcamentos-sem-resposta");
  revalidatePath("/mais");
  revalidatePath("/pedidos");
}

export async function marcarPedidoSeguidoAction(pedidoId: string): Promise<void> {
  if (!pedidoId) return;
  await marcarPedidoSeguido(pedidoId);
  revalidarTudo();
}

/** Reaproveita o estado "perdido" que já existe em EstadoPedido (já
 * usado noutros sítios da app) — não precisa de nenhuma coluna nova. */
export async function marcarPedidoPerdidoAction(pedidoId: string): Promise<void> {
  if (!pedidoId) return;
  await atualizarEstadoPedido(pedidoId, "perdido");
  revalidarTudo();
}
