import "server-only";
import { criarClienteSupabase } from "@/lib/supabase/server";
import type {
  Cliente,
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

export async function associarViaturaAoPedido(id: string, viaturaId: string): Promise<void> {
  const supabase = criarClienteSupabase();
  const { error } = await supabase
    .from("pedidos")
    .update({ viatura_id: viaturaId, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
