import "server-only";
import { criarClienteSupabase } from "@/lib/supabase/server";
import type { Cliente, Servico, Viatura } from "@/lib/types";

export async function listarClientes(pesquisa?: string): Promise<Cliente[]> {
  const supabase = criarClienteSupabase();
  let query = supabase.from("clientes").select("*").order("nome");

  if (pesquisa) {
    query = query.or(`nome.ilike.%${pesquisa}%,telefone.ilike.%${pesquisa}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function obterCliente(id: string): Promise<Cliente | null> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase.from("clientes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export interface ClienteComDetalhe {
  cliente: Cliente;
  viaturas: Viatura[];
  servicos: Servico[];
  totalGasto: number;
  ultimaData: string | null;
}

export async function obterClienteComDetalhe(id: string): Promise<ClienteComDetalhe | null> {
  const supabase = criarClienteSupabase();

  const [{ data: cliente, error: erroCliente }, { data: viaturas, error: erroViaturas }, { data: servicos, error: erroServicos }] =
    await Promise.all([
      supabase.from("clientes").select("*").eq("id", id).maybeSingle(),
      supabase.from("viaturas").select("*").eq("cliente_id", id).order("created_at", { ascending: false }),
      supabase.from("servicos").select("*").eq("cliente_id", id).order("data_conclusao", { ascending: false }),
    ]);

  if (erroCliente) throw erroCliente;
  if (!cliente) return null;
  if (erroViaturas) throw erroViaturas;
  if (erroServicos) throw erroServicos;

  const listaServicos = servicos ?? [];
  const totalGasto = listaServicos.reduce((soma, s) => soma + Number(s.preco_final), 0);
  const ultimaData = listaServicos[0]?.data_conclusao ?? null;

  return { cliente, viaturas: viaturas ?? [], servicos: listaServicos, totalGasto, ultimaData };
}

export interface DadosCliente {
  nome: string;
  telefone: string;
  fonte: Cliente["fonte"];
  notas: string | null;
}

export async function criarCliente(dados: DadosCliente): Promise<Cliente> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase.from("clientes").insert(dados).select().single();
  if (error) throw error;
  return data;
}

export async function atualizarCliente(id: string, dados: DadosCliente): Promise<void> {
  const supabase = criarClienteSupabase();
  const { error } = await supabase
    .from("clientes")
    .update({ ...dados, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
