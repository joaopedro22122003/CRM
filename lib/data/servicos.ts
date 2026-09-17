import "server-only";
import { criarClienteSupabase } from "@/lib/supabase/server";
import type { Cliente, Faturacao, Pedido, Servico, ServicoFoto, TipoFoto, Viatura } from "@/lib/types";

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

  const [{ data: fotos, error: erroFotos }, { data: faturacao, error: erroFat }] = await Promise.all([
    supabase.from("servico_fotos").select("*").eq("servico_id", id).order("created_at"),
    supabase.from("faturacao").select("*").eq("servico_id", id).maybeSingle(),
  ]);
  if (erroFotos) throw erroFotos;
  if (erroFat) throw erroFat;

  return { servico: resto, pedido, cliente, viatura, fotos: fotos ?? [], faturacao: faturacao ?? null };
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

export async function criarServico(dados: DadosServico): Promise<Servico> {
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

  await supabase.from("faturacao").insert({
    servico_id: servico.id,
    valor: dados.preco_final,
    estado: "pendente",
  });

  return servico;
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
