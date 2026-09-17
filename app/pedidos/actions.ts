"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { criarPedido, atualizarEstadoPedido, associarViaturaAoPedido } from "@/lib/data/pedidos";
import type { EstadoPedido } from "@/lib/types";

export type EstadoFormulario = { erro?: string };

export async function criarPedidoAction(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const clienteId = String(formData.get("cliente_id") ?? "");
  const viaturaId = String(formData.get("viatura_id") ?? "") || null;
  const resumo = String(formData.get("resumo_problema") ?? "").trim() || null;

  if (!clienteId) return { erro: "Falta selecionar o cliente." };

  const pedido = await criarPedido({ cliente_id: clienteId, viatura_id: viaturaId, resumo_problema: resumo });

  revalidatePath("/pedidos");
  redirect(`/pedidos/${pedido.id}`);
}

export async function mudarEstadoAction(formData: FormData): Promise<void> {
  const pedidoId = String(formData.get("pedido_id") ?? "");
  const estado = String(formData.get("estado") ?? "") as EstadoPedido;
  if (!pedidoId || !estado) return;

  await atualizarEstadoPedido(pedidoId, estado);
  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${pedidoId}`);
}

export async function associarViaturaAction(formData: FormData): Promise<void> {
  const pedidoId = String(formData.get("pedido_id") ?? "");
  const viaturaId = String(formData.get("viatura_id") ?? "");
  if (!pedidoId || !viaturaId) return;

  await associarViaturaAoPedido(pedidoId, viaturaId);
  revalidatePath(`/pedidos/${pedidoId}`);
}
