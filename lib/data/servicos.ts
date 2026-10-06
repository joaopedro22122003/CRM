import "server-only";
import { criarClienteSupabase } from "@/lib/supabase/server";
import type { Cliente, Faturacao, Pedido, Servico, ServicoFoto, TipoFoto, Viatura } from "@/lib/types";
import { obterUltimoOrcamentoDoPedido, type ResumoOrcamento } from "@/lib/data/orcamentos";

const BUCKET_FOTOS = "fotos-servicos";

export interface ServicoResumo extends Servico {
  cliente: Pick<Cliente, "id" | "nome">;
  viatura: Pick<Viatura, "id" | "marca" | "modelo">;
}

export async function listarServicosRecentes(limite = 50): Promise<ServicoResumo[]> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase
    .from("servicos")
    .select("*, cliente:clientes(id, nome), viatura:viaturas(id, marca, modelo)")
    .order("data_conclusao", { ascending: false })
    .limit(limite);
  if (error) throw error;
  return (data ?? []) as unknown as ServicoResumo[];
}

export interface ServicoComDetalhe {
  servico: Servico;
  pedido: Pedido;
  cliente: Cliente;
  viatura: Viatura;
  fotos: ServicoFoto[];
  faturacao: Faturacao | null;
  orcamento: ResumoOrcamento | null;
}

export async function obterServicoComDetalhe(id: string): Promise<ServicoComDetalhe | null> {
  const supabase = criarClienteSupabase();

  const { data: servico, error } = await supabase
    .from("servicos")
    .select("*, pedido:pedidos(*), cliente:clientes(*), viatura:viaturas(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!servico) return null;

  const { pedido, cliente, viatura, ...resto } = servico as Servico & {
    pedido: Pedido;
    cliente: Cliente;
    viatura: Viatura;
  };

  const [{ data: fotos, error: erroFotos }, { data: faturacao, error: erroFat }, orcamento] = await Promise.all([
    supabase.from("servico_fotos").select("*").eq("servico_id", id).order("created_at"),
    supabase.from("faturacao").select("*").eq("servico_id", id).maybeSingle(),
    obterUltimoOrcamentoDoPedido(pedido.id),
  ]);
  if (erroFotos) throw erroFotos;
  if (erroFat) throw erroFat;

  return { servico: resto, pedido, cliente, viatura, fotos: fotos ?? [], faturacao: faturacao ?? null, orcamento };
}

export interface DadosServico {
  pedido_id: string;
  marcacao_id: string | null;
  viatura_id: string;
  cliente_id: string;
  data_conclusao: string;
  preco_final: number;
  custo_produtos: number;
  tempo_execucao_min: number | null;
  tempo_deslocacao_min: number;
  notas_incidentes: string | null;
}

export async function criarServico(
  dados: DadosServico,
  opcoes?: { pago?: boolean; valorPorConfirmar?: boolean }
): Promise<Servico> {
  const supabase = criarClienteSupabase();

  const { data: servico, error } = await supabase.from("servicos").insert(dados).select().single();
  if (error) throw error;

  await supabase
    .from("pedidos")
    .update({ estado: "concluido", updated_at: new Date().toISOString() })
    .eq("id", dados.pedido_id);

  if (dados.marcacao_id) {
    await supabase.from("marcacoes").update({ estado: "concluido" }).eq("id", dados.marcacao_id);
  }

  const pago = opcoes?.pago ?? false;
  await supabase.from("faturacao").insert({
    servico_id: servico.id,
    valor: dados.preco_final,
    estado: pago ? "pago" : "pendente",
    data_pagamento: pago ? new Date().toISOString().slice(0, 10) : null,
    valor_por_confirmar: opcoes?.valorPorConfirmar ?? false,
  });

  return servico;
}

export type ResultadoDesfazerServico = "removido" | "bloqueado_pago" | "nada_a_fazer";

/** Desfaz o serviço criado a partir de uma marcação específica (nunca
 * outro serviço do mesmo pedido), usado para reverter um toque errado em
 * "Serviço feito". Nunca apaga um pagamento já confirmado — nesse caso
 * bloqueia e deixa tudo como está. */
export async function desfazerServicoDaMarcacao(marcacaoId: string): Promise<ResultadoDesfazerServico> {
  const supabase = criarClienteSupabase();

  const { data: servico, error: erroServico } = await supabase
    .from("servicos")
    .select("id, pedido_id")
    .eq("marcacao_id", marcacaoId)
    .maybeSingle();
  if (erroServico) throw erroServico;
  if (!servico) return "nada_a_fazer";

  const { data: faturacao, error: erroFat } = await supabase
    .from("faturacao")
    .select("estado")
    .eq("servico_id", servico.id)
    .maybeSingle();
  if (erroFat) throw erroFat;
  if (faturacao?.estado === "pago") return "bloqueado_pago";

  // O "on delete cascade" do esquema (0001_init.sql) apaga sozinho a
  // faturação pendente e as fotos associadas a este serviço.
  const { error: erroApagar } = await supabase.from("servicos").delete().eq("id", servico.id);
  if (erroApagar) throw erroApagar;

  await supabase
    .from("pedidos")
    .update({ estado: "marcado", updated_at: new Date().toISOString() })
    .eq("id", servico.pedido_id);

  return "removido";
}

export async function adicionarFotos(
  servicoId: string,
  arquivos: { tipo: TipoFoto; file: File }[]
): Promise<void> {
  if (arquivos.length === 0) return;
  const supabase = criarClienteSupabase();

  for (const { tipo, file } of arquivos) {
    const extensao = file.name.split(".").pop() || "jpg";
    const caminho = `${servicoId}/${tipo}/${crypto.randomUUID()}.${extensao}`;

    const { error: erroUpload } = await supabase.storage
      .from(BUCKET_FOTOS)
      .upload(caminho, file, { contentType: file.type || "image/jpeg" });
    if (erroUpload) throw erroUpload;

    const { data: publico } = supabase.storage.from(BUCKET_FOTOS).getPublicUrl(caminho);

    const { error: erroInsercao } = await supabase
      .from("servico_fotos")
      .insert({ servico_id: servicoId, tipo, url: publico.publicUrl });
    if (erroInsercao) throw erroInsercao;
  }
}
