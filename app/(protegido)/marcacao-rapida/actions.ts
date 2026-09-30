"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { criarCliente } from "@/lib/data/clientes";
import { criarViatura, obterViatura } from "@/lib/data/viaturas";
import { criarPedido } from "@/lib/data/pedidos";
import { criarOrcamento } from "@/lib/data/orcamentos";
import { obterConfiguracaoPrecos } from "@/lib/data/precos";
import { criarMarcacao } from "@/lib/data/marcacoes";
import { calcularPrecoOrcamento, materialDefinido, type ExtraOrcamento } from "@/lib/pricing";
import type { EstofosMaterial, Fonte, MaterialBancos, Pacote, TipoMarcacao } from "@/lib/types";

export type ClienteAssistente =
  | { modo: "existente"; id: string }
  | { modo: "novo"; nome: string; telefone: string; fonte: Fonte };

export type ViaturaAssistente =
  | { modo: "existente"; id: string }
  | {
      modo: "novo";
      marca: string;
      modelo: string;
      matricula: string | null;
      materialBancos: MaterialBancos;
    };

export interface DadosAssistente {
  cliente: ClienteAssistente;
  viatura: ViaturaAssistente;
  pacote: Pacote;
  temEstofos: boolean;
  extras: ExtraOrcamento[];
  resumoProblema: string | null;
  notasVariacao: string | null;
  marcacao: {
    data: string;
    hora: string;
    duracaoMin: number;
    tipo: TipoMarcacao;
    zona: string | null;
    notas: string | null;
  };
}

export type EstadoAssistente = { erro?: string };

export async function criarMarcacaoRapidaAction(dados: DadosAssistente): Promise<EstadoAssistente> {
  // Cliente: usa o existente ou cria um novo.
  let clienteId: string;
  if (dados.cliente.modo === "existente") {
    clienteId = dados.cliente.id;
  } else {
    if (!dados.cliente.nome.trim()) return { erro: "Falta o nome do cliente." };
    if (!dados.cliente.telefone.trim()) return { erro: "Falta o contacto do cliente." };
    const cliente = await criarCliente({
      nome: dados.cliente.nome.trim(),
      telefone: dados.cliente.telefone.trim(),
      fonte: dados.cliente.fonte,
      notas: null,
    });
    clienteId = cliente.id;
  }

  // Viatura: usa a existente ou cria uma nova, já associada ao cliente.
  let viaturaId: string;
  let materialBancos: MaterialBancos;
  if (dados.viatura.modo === "existente") {
    const viaturaExistente = await obterViatura(dados.viatura.id);
    if (!viaturaExistente) return { erro: "Viatura não encontrada." };
    viaturaId = viaturaExistente.id;
    materialBancos = viaturaExistente.material_bancos;
  } else {
    if (!dados.viatura.marca.trim()) return { erro: "Falta a marca da viatura." };
    if (!dados.viatura.modelo.trim()) return { erro: "Falta o modelo da viatura." };
    const viatura = await criarViatura(clienteId, {
      marca: dados.viatura.marca.trim(),
      modelo: dados.viatura.modelo.trim(),
      matricula: dados.viatura.matricula,
      material_bancos: dados.viatura.materialBancos,
      notas: null,
    });
    viaturaId = viatura.id;
    materialBancos = dados.viatura.materialBancos;
  }

  // Pedido
  const pedido = await criarPedido({
    cliente_id: clienteId,
    viatura_id: viaturaId,
    resumo_problema: dados.resumoProblema,
  });

  // Orçamento — regra inegociável: só com estofos se o material
  // estiver definido (a app já impede isto na interface, mas
  // revalidamos no servidor).
  if (dados.temEstofos && !materialDefinido(materialBancos)) {
    return { erro: "Define o material dos bancos antes de orçamentar estofos." };
  }

  const precos = await obterConfiguracaoPrecos();
  const resultado = calcularPrecoOrcamento({
    pacote: dados.pacote,
    temEstofos: dados.temEstofos,
    extras: dados.extras,
    precos,
  });

  await criarOrcamento({
    pedidoId: pedido.id,
    pacote: dados.pacote,
    temEstofos: dados.temEstofos,
    estofosMaterial: dados.temEstofos ? (materialBancos as EstofosMaterial) : null,
    extras: dados.extras,
    notasVariacao: dados.notasVariacao,
    resultado,
  });

  // Marcação
  const dataHora = new Date(`${dados.marcacao.data}T${dados.marcacao.hora}`);
  if (Number.isNaN(dataHora.getTime())) return { erro: "Data ou hora da marcação inválida." };

  await criarMarcacao({
    pedido_id: pedido.id,
    data_hora: dataHora.toISOString(),
    duracao_estimada_min: dados.marcacao.duracaoMin,
    tipo: dados.marcacao.tipo,
    zona: dados.marcacao.zona,
    notas: dados.marcacao.notas,
  });

  revalidatePath("/pedidos");
  revalidatePath("/clientes");
  revalidatePath("/marcacoes");
  redirect(`/pedidos/${pedido.id}`);
}
