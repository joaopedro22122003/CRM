import "server-only";
import { criarClienteSupabase } from "@/lib/supabase/server";
import type { Cliente, EstadoMarcacao, Marcacao, Pedido, TipoMarcacao, Viatura } from "@/lib/types";

export interface MarcacaoResumo extends Marcacao {
  pedido: Pick<Pedido, "id"> & {
    cliente: Pick<Cliente, "id" | "nome" | "telefone">;
    viatura: Pick<Viatura, "id" | "marca" | "modelo"> | null;
  };
}

export async function listarMarcacoesEntre(inicioIso: string, fimIso: string): Promise<MarcacaoResumo[]> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase
    .from("marcacoes")
    .select("*, pedido:pedidos(id, cliente:clientes(id, nome, telefone), viatura:viaturas(id, marca, modelo))")
    .gte("data_hora", inicioIso)
    .lt("data_hora", fimIso)
    .order("data_hora");
  if (error) throw error;
  return (data ?? []) as unknown as MarcacaoResumo[];
}

export interface MarcacaoComDetalhe {
  marcacao: Marcacao;
  pedido: Pedido;
  cliente: Cliente;
  viatura: Viatura | null;
}

export async function obterMarcacaoComDetalhe(id: string): Promise<MarcacaoComDetalhe | null> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase
    .from("marcacoes")
    .select("*, pedido:pedidos(*, cliente:clientes(*), viatura:viaturas(*))")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { pedido: pedidoBruto, ...marcacao } = data as Marcacao & {
    pedido: Pedido & { cliente: Cliente; viatura: Viatura | null };
  };
  const { cliente, viatura, ...pedido } = pedidoBruto;

  return { marcacao, pedido, cliente, viatura };
}

export interface DadosMarcacao {
  pedido_id: string;
  data_hora: string;
  duracao_estimada_min: number;
  tipo: TipoMarcacao;
  zona: string | null;
  notas: string | null;
}

export async function criarMarcacao(dados: DadosMarcacao): Promise<Marcacao> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase.from("marcacoes").insert(dados).select().single();
  if (error) throw error;

  await supabase
    .from("pedidos")
    .update({ estado: "marcado", updated_at: new Date().toISOString() })
    .eq("id", dados.pedido_id)
    .in("estado", ["novo", "qualificado", "orcamentado"]);

  return data;
}

export async function atualizarEstadoMarcacao(id: string, estado: EstadoMarcacao): Promise<void> {
  const supabase = criarClienteSupabase();
  const { error } = await supabase.from("marcacoes").update({ estado }).eq("id", id);
  if (error) throw error;
}
