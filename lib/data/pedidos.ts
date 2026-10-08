import "server-only";
import { criarClienteSupabase } from "@/lib/supabase/server";
import type {
  Cliente,
  EstadoFaturacao,
  EstadoPedido,
  Marcacao,
  Orcamento,
  Pedido,
  Servico,
  Viatura,
} from "@/lib/types";

export interface PedidoResumo extends Pedido {
  cliente: Pick<Cliente, "id" | "nome" | "telefone">;
  viatura: Pick<Viatura, "id" | "marca" | "modelo"> | null;
}

export async function listarPedidos(): Promise<PedidoResumo[]> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase
    .from("pedidos")
    .select("*, cliente:clientes(id, nome, telefone), viatura:viaturas(id, marca, modelo)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as PedidoResumo[];
}

export interface PedidoComPagamento extends PedidoResumo {
  /** Valor sugerido para a confirmação de pagamento: o do orçamento mais
   * recente, ou o do serviço já registado, se já existir. */
  valorSugerido: number | null;
  /** null = ainda sem serviço/faturação; caso contrário o estado atual. */
  estadoPagamento: EstadoFaturacao | null;
}

export async function listarPedidosComPagamento(): Promise<PedidoComPagamento[]> {
  const supabase = criarClienteSupabase();
  const pedidos = await listarPedidos();
  if (pedidos.length === 0) return [];

  const ids = pedidos.map((p) => p.id);

  const [{ data: orcamentos, error: erroOrc }, { data: servicos, error: erroServ }] = await Promise.all([
    supabase
      .from("orcamentos")
      .select("pedido_id, preco_entrada, created_at")
      .in("pedido_id", ids)
      .order("created_at", { ascending: false }),
    supabase
      .from("servicos")
      .select("id, pedido_id, preco_final, created_at")
      .in("pedido_id", ids)
      .order("created_at", { ascending: false }),
  ]);
  if (erroOrc) throw erroOrc;
  if (erroServ) throw erroServ;

  const mapaOrcamento = new Map<string, number>();
  for (const o of orcamentos ?? []) {
    if (!mapaOrcamento.has(o.pedido_id)) mapaOrcamento.set(o.pedido_id, Number(o.preco_entrada));
  }

  const mapaServico = new Map<string, { id: string; preco_final: number }>();
  for (const s of servicos ?? []) {
    if (!mapaServico.has(s.pedido_id)) mapaServico.set(s.pedido_id, { id: s.id, preco_final: Number(s.preco_final) });
  }

  const servicoIds = [...mapaServico.values()].map((s) => s.id);
  const mapaFaturacao = new Map<string, EstadoFaturacao>();
  if (servicoIds.length > 0) {
    const { data: faturacoes, error: erroFat } = await supabase
      .from("faturacao")
      .select("servico_id, estado")
      .in("servico_id", servicoIds);
    if (erroFat) throw erroFat;
    for (const f of faturacoes ?? []) mapaFaturacao.set(f.servico_id, f.estado as EstadoFaturacao);
  }

  return pedidos.map((p) => {
    const servico = mapaServico.get(p.id) ?? null;
    return {
      ...p,
      valorSugerido: mapaOrcamento.get(p.id) ?? servico?.preco_final ?? null,
      estadoPagamento: servico ? (mapaFaturacao.get(servico.id) ?? "pendente") : null,
    };
  });
}

export interface PedidoComDetalhe {
  pedido: Pedido;
  cliente: Cliente;
  viatura: Viatura | null;
  orcamentos: Orcamento[];
  marcacoes: Marcacao[];
  servicos: Servico[];
}

export async function obterPedidoComDetalhe(id: string): Promise<PedidoComDetalhe | null> {
  const supabase = criarClienteSupabase();

  const { data: pedido, error } = await supabase
    .from("pedidos")
    .select("*, cliente:clientes(*), viatura:viaturas(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!pedido) return null;

  const { cliente, viatura, ...resto } = pedido as Pedido & { cliente: Cliente; viatura: Viatura | null };

  const [{ data: orcamentos, error: erroOrc }, { data: marcacoes, error: erroMarc }, { data: servicos, error: erroServ }] =
    await Promise.all([
      supabase.from("orcamentos").select("*").eq("pedido_id", id).order("created_at", { ascending: false }),
      supabase.from("marcacoes").select("*").eq("pedido_id", id).order("data_hora", { ascending: false }),
      supabase.from("servicos").select("*").eq("pedido_id", id).order("data_conclusao", { ascending: false }),
    ]);

  if (erroOrc) throw erroOrc;
  if (erroMarc) throw erroMarc;
  if (erroServ) throw erroServ;

  return {
    pedido: resto,
    cliente,
    viatura,
    orcamentos: orcamentos ?? [],
    marcacoes: marcacoes ?? [],
    servicos: servicos ?? [],
  };
}

export interface DadosPedido {
  cliente_id: string;
  viatura_id: string | null;
  resumo_problema: string | null;
}

export async function listarPedidosAbertos(): Promise<PedidoResumo[]> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase
    .from("pedidos")
    .select("*, cliente:clientes(id, nome, telefone), viatura:viaturas(id, marca, modelo)")
    .not("estado", "in", "(concluido,perdido)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as PedidoResumo[];
}

export async function criarPedido(dados: DadosPedido): Promise<Pedido> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase.from("pedidos").insert(dados).select().single();
  if (error) throw error;
  return data;
}

export async function atualizarEstadoPedido(id: string, estado: EstadoPedido): Promise<void> {
  const supabase = criarClienteSupabase();
  const { error } = await supabase
    .from("pedidos")
    .update({ estado, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/** Regista que foi feito o (único) seguimento a um orçamento sem
 * resposta — para o pedido sair da lista e nunca voltar a ser
 * incomodado por este motivo. Nunca apaga nada. */
export async function marcarPedidoSeguido(id: string): Promise<void> {
  const supabase = criarClienteSupabase();
  const { error } = await supabase
    .from("pedidos")
    .update({ seguimento_em: new Date().toISOString().slice(0, 10) })
    .eq("id", id);
  if (error) throw error;
}

export async function associarViaturaAoPedido(id: string, viaturaId: string): Promise<void> {
  const supabase = criarClienteSupabase();
  const { error } = await supabase
    .from("pedidos")
    .update({ viatura_id: viaturaId, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
