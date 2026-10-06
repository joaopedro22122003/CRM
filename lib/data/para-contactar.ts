import "server-only";
import { criarClienteSupabase } from "@/lib/supabase/server";
import type { Cliente, Viatura } from "@/lib/types";

const DIAS_MINIMOS = 30;

export interface ClienteParaContactar {
  cliente: Pick<Cliente, "id" | "nome" | "telefone" | "contactado_em">;
  viatura: Pick<Viatura, "marca" | "modelo"> | null;
  dataUltimoServico: string;
}

/** Clientes cujo último serviço concluído foi há 30 dias ou mais, sem
 * marcação futura agendada e ainda não contactados depois desse serviço
 * (ver regras detalhadas no plano da funcionalidade). */
export async function listarClientesParaContactar(): Promise<ClienteParaContactar[]> {
  const supabase = criarClienteSupabase();

  const { data: servicos, error: erroServicos } = await supabase
    .from("servicos")
    .select("cliente_id, data_conclusao, viatura:viaturas(marca, modelo)")
    .order("data_conclusao", { ascending: false });
  if (erroServicos) throw erroServicos;

  // O primeiro que encontramos por cliente é o mais recente (já vem ordenado).
  const ultimoServicoPorCliente = new Map<
    string,
    { dataUltimoServico: string; viatura: Pick<Viatura, "marca" | "modelo"> | null }
  >();
  for (const s of servicos ?? []) {
    if (ultimoServicoPorCliente.has(s.cliente_id)) continue;
    ultimoServicoPorCliente.set(s.cliente_id, {
      dataUltimoServico: s.data_conclusao,
      viatura: (s.viatura as unknown as Pick<Viatura, "marca" | "modelo"> | null) ?? null,
    });
  }

  if (ultimoServicoPorCliente.size === 0) return [];

  const clienteIds = [...ultimoServicoPorCliente.keys()];

  const [{ data: clientes, error: erroClientes }, { data: marcacoesFuturas, error: erroMarcacoes }] =
    await Promise.all([
      supabase
        .from("clientes")
        .select("id, nome, telefone, contactado_em")
        .in("id", clienteIds),
      supabase
        .from("marcacoes")
        .select("data_hora, pedido:pedidos(cliente_id)")
        .eq("estado", "agendado")
        .gt("data_hora", new Date().toISOString()),
    ]);
  if (erroClientes) throw erroClientes;
  if (erroMarcacoes) throw erroMarcacoes;

  const clientesComMarcacaoFutura = new Set(
    (marcacoesFuturas ?? []).map((m) => (m.pedido as unknown as { cliente_id: string }).cliente_id)
  );

  const hoje = new Date();
  const resultado: ClienteParaContactar[] = [];

  for (const cliente of clientes ?? []) {
    const ultimo = ultimoServicoPorCliente.get(cliente.id);
    if (!ultimo) continue;
    if (clientesComMarcacaoFutura.has(cliente.id)) continue;

    const dataServico = new Date(`${ultimo.dataUltimoServico}T00:00:00`);
    const diasDesde = Math.floor((hoje.getTime() - dataServico.getTime()) / 86_400_000);
    if (diasDesde < DIAS_MINIMOS) continue;

    // Já contactado depois (ou no mesmo dia) do último serviço — não repete.
    if (cliente.contactado_em && cliente.contactado_em >= ultimo.dataUltimoServico) continue;

    resultado.push({ cliente, viatura: ultimo.viatura, dataUltimoServico: ultimo.dataUltimoServico });
  }

  resultado.sort((a, b) => (a.dataUltimoServico < b.dataUltimoServico ? -1 : 1));

  return resultado;
}
