"use server";

import { revalidatePath } from "next/cache";
import { criarCliente, obterClientePorTelefone } from "@/lib/data/clientes";
import { criarViatura } from "@/lib/data/viaturas";
import { criarPedido, atualizarEstadoPedido } from "@/lib/data/pedidos";
import { criarOrcamento } from "@/lib/data/orcamentos";
import { obterConfiguracaoPrecos } from "@/lib/data/precos";
import { calcularPrecoOrcamento } from "@/lib/pricing";
import type { Pacote } from "@/lib/types";

export type EstadoPedidoRapido = { erro?: string; sucesso?: boolean };

const PACOTES_VALIDOS: Pacote[] = ["inicial", "detalhe", "completo"];

/** Divide um texto livre de carro em marca/modelo (viaturas exige os
 * dois campos) — a primeira palavra vira marca, o resto vira modelo;
 * sem espaço, fica tudo na marca. É só um ponto de partida: o cliente
 * criado aqui pode sempre ser corrigido depois no ecrã da viatura. */
function dividirCarro(texto: string): { marca: string; modelo: string } {
  const partes = texto.trim().split(/\s+/);
  return { marca: partes[0], modelo: partes.slice(1).join(" ") || "—" };
}

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
  if (!carro) return { erro: "Falta o carro." };

  // Cliente: reaproveita se já existir o mesmo telemóvel (comparado de
  // forma normalizada), para nunca criar um duplicado.
  const clienteExistente = await obterClientePorTelefone(telefone);
  const clienteId = clienteExistente
    ? clienteExistente.id
    : (await criarCliente({ nome, telefone, fonte: "outro", notas: null })).id;

  const { marca, modelo } = dividirCarro(carro);
  const viatura = await criarViatura(clienteId, {
    marca,
    modelo,
    matricula: null,
    material_bancos: "por_definir",
    notas: null,
  });

  const pedido = await criarPedido({
    cliente_id: clienteId,
    viatura_id: viatura.id,
    resumo_problema: null,
  });

  const pacote = PACOTES_VALIDOS.includes(pacoteBruto as Pacote) ? (pacoteBruto as Pacote) : null;

  if (pacote) {
    // Reaproveita exatamente o mesmo motor de preços e a mesma função
    // de criar orçamento que o assistente completo usa — criarOrcamento
    // já trata de passar o pedido a "orcamentado".
    const precos = await obterConfiguracaoPrecos();
    const resultado = calcularPrecoOrcamento({ pacote, temEstofos: false, extras: [], precos });
    await criarOrcamento({
      pedidoId: pedido.id,
      pacote,
      temEstofos: false,
      estofosMaterial: null,
      extras: [],
      notasVariacao: null,
      resultado,
    });
  } else {
    // Sem pacote escolhido: fica "orcamentado" na mesma (pedido com
    // preço por combinar), sem nenhuma linha de orçamento associada.
    await atualizarEstadoPedido(pedido.id, "orcamentado");
  }

  revalidatePath("/pedidos");
  revalidatePath("/clientes");
  revalidatePath("/orcamentos-sem-resposta");
  revalidatePath("/mais");

  return { sucesso: true };
}
