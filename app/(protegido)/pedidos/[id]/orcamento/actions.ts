"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { obterPedidoComDetalhe } from "@/lib/data/pedidos";
import { obterConfiguracaoPrecos } from "@/lib/data/precos";
import { criarOrcamento } from "@/lib/data/orcamentos";
import { calcularPrecoOrcamento, materialDefinido, type ExtraOrcamento } from "@/lib/pricing";
import type { EstofosMaterial, Pacote } from "@/lib/types";

export type EstadoFormulario = { erro?: string };

export async function guardarOrcamento(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const pedidoId = String(formData.get("pedido_id") ?? "");
  const pacote = String(formData.get("pacote") ?? "") as Pacote;
  const temEstofos = formData.get("tem_estofos") === "on";
  const notasVariacao = String(formData.get("notas_variacao") ?? "").trim() || null;
  const extrasJson = String(formData.get("extras") ?? "[]");

  if (!pedidoId) return { erro: "Pedido inválido." };
  if (!["inicial", "detalhe", "completo"].includes(pacote)) {
    return { erro: "Escolhe um dos três pacotes." };
  }

  let extras: ExtraOrcamento[] = [];
  try {
    const bruto = JSON.parse(extrasJson);
    if (Array.isArray(bruto)) {
      extras = bruto
        .map((e) => ({ descricao: String(e.descricao ?? "").trim(), preco: Number(e.preco) || 0 }))
        .filter((e) => e.descricao !== "");
    }
  } catch {
    extras = [];
  }

  const detalhe = await obterPedidoComDetalhe(pedidoId);
  if (!detalhe) return { erro: "Pedido não encontrado." };

  // Regra inegociável: só se pode orçamentar estofos depois de o
  // material dos bancos da viatura estar definido.
  const materialViatura = detalhe.viatura?.material_bancos ?? null;
  const estofosMaterial: EstofosMaterial | null =
    materialViatura && materialDefinido(materialViatura) ? (materialViatura as EstofosMaterial) : null;

  if (temEstofos && !estofosMaterial) {
    return {
      erro:
        "Para orçamentar limpeza de estofos é preciso primeiro definir o material dos bancos na ficha da viatura.",
    };
  }

  const precos = await obterConfiguracaoPrecos();

  const resultado = calcularPrecoOrcamento({ pacote, temEstofos, extras, precos });

  await criarOrcamento({
    pedidoId,
    pacote,
    temEstofos,
    estofosMaterial: temEstofos ? estofosMaterial : null,
    extras,
    notasVariacao,
    resultado,
  });

  revalidatePath(`/pedidos/${pedidoId}`);
  revalidatePath("/pedidos");
  redirect(`/pedidos/${pedidoId}`);
}
