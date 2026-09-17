// Tipos que espelham o esquema em supabase/migrations/0001_init.sql

export type Fonte = "instagram" | "passa_palavra" | "outro";

export type MaterialBancos = "pele" | "sintetico" | "tecido" | "alcantara" | "por_definir";

export type EstadoPedido =
  | "novo"
  | "qualificado"
  | "orcamentado"
  | "marcado"
  | "concluido"
  | "perdido";

export type Pacote = "inicial" | "detalhe" | "completo";

export type EstofosMaterial = "pele_sintetico" | "tecido_alcantara";

export type TipoMarcacao = "cliente_traz" | "recolha_entrega";

export type EstadoMarcacao = "agendado" | "concluido" | "cancelado";

export type TipoFoto = "antes" | "depois";

export type EstadoFaturacao = "pago" | "pendente";

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  fonte: Fonte;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface Viatura {
  id: string;
  cliente_id: string;
  marca: string;
  modelo: string;
  matricula: string | null;
  material_bancos: MaterialBancos;
  notas: string | null;
  created_at: string;
}

export interface ConfiguracaoPrecos {
  id: number;
  preco_inicial: number;
  preco_detalhe: number;
  preco_completo: number;
  preco_pele_sintetico: number;
  preco_tecido_alcantara: number;
  desconto_combo: number;
  updated_at: string;
}

export interface Pedido {
  id: string;
  cliente_id: string;
  viatura_id: string | null;
  estado: EstadoPedido;
  resumo_problema: string | null;
  created_at: string;
  updated_at: string;
}

export interface Orcamento {
  id: string;
  pedido_id: string;
  pacote: Pacote;
  tem_estofos: boolean;
  estofos_material: EstofosMaterial | null;
  combo_aplicado: boolean;
  preco_base: number;
  preco_estofos: number;
  desconto_combo: number;
  total_extras: number;
  preco_entrada: number;
  notas_variacao: string | null;
  created_at: string;
}

export interface OrcamentoExtra {
  id: string;
  orcamento_id: string;
  descricao: string;
  preco: number;
}

export interface Marcacao {
  id: string;
  pedido_id: string;
  data_hora: string;
  duracao_estimada_min: number;
  tipo: TipoMarcacao;
  zona: string | null;
  estado: EstadoMarcacao;
  notas: string | null;
  created_at: string;
}

export interface Servico {
  id: string;
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
  created_at: string;
}

export interface ServicoFoto {
  id: string;
  servico_id: string;
  tipo: TipoFoto;
  url: string;
  created_at: string;
}

export interface Faturacao {
  id: string;
  servico_id: string;
  valor: number;
  data_pagamento: string | null;
  metodo_pagamento: string | null;
  estado: EstadoFaturacao;
  notas: string | null;
  created_at: string;
}

export const ESTADOS_PEDIDO: { valor: EstadoPedido; rotulo: string }[] = [
  { valor: "novo", rotulo: "Novo" },
  { valor: "qualificado", rotulo: "Qualificado" },
  { valor: "orcamentado", rotulo: "Orçamentado" },
  { valor: "marcado", rotulo: "Marcado" },
  { valor: "concluido", rotulo: "Concluído" },
  { valor: "perdido", rotulo: "Perdido" },
];

export const ROTULOS_PACOTE: Record<Pacote, string> = {
  inicial: "Inicial",
  detalhe: "Detalhe",
  completo: "Completo",
};

export const ROTULOS_MATERIAL_BANCOS: Record<MaterialBancos, string> = {
  pele: "Pele",
  sintetico: "Sintético",
  tecido: "Tecido",
  alcantara: "Alcântara",
  por_definir: "Por definir",
};

export const ROTULOS_ESTOFOS_MATERIAL: Record<EstofosMaterial, string> = {
  pele_sintetico: "Pele / Sintético",
  tecido_alcantara: "Tecido / Alcântara",
};

export const ROTULOS_FONTE: Record<Fonte, string> = {
  instagram: "Instagram",
  passa_palavra: "Passa-palavra",
  outro: "Outro",
};
