import "server-only";
import { criarClienteSupabase } from "@/lib/supabase/server";
import type { Cliente, MaterialBancos, Viatura } from "@/lib/types";

export async function obterViatura(id: string): Promise<Viatura | null> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase.from("viaturas").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function obterViaturaComCliente(
  id: string
): Promise<{ viatura: Viatura; cliente: Cliente } | null> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase
    .from("viaturas")
    .select("*, cliente:clientes(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { cliente, ...viatura } = data as Viatura & { cliente: Cliente };
  return { viatura, cliente };
}

export async function listarViaturasDoCliente(clienteId: string): Promise<Viatura[]> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase
    .from("viaturas")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export interface DadosViatura {
  marca: string;
  modelo: string;
  matricula: string | null;
  material_bancos: MaterialBancos;
  notas: string | null;
}

export async function criarViatura(clienteId: string, dados: DadosViatura): Promise<Viatura> {
  const supabase = criarClienteSupabase();
  const { data, error } = await supabase
    .from("viaturas")
    .insert({ cliente_id: clienteId, ...dados })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function atualizarViatura(id: string, dados: DadosViatura): Promise<void> {
  const supabase = criarClienteSupabase();
  const { error } = await supabase.from("viaturas").update(dados).eq("id", id);
  if (error) throw error;
}
