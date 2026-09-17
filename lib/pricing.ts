import type {
  ConfiguracaoPrecos,
  EstofosMaterial,
  MaterialBancos,
  Pacote,
} from "./types";

/**
 * Motor central de preços. Todas as regras de negócio inegociáveis da
 * Garagem do Jota vivem aqui — nenhum ecrã calcula preços por fora
 * desta função, para nunca ser possível inverter Tecido/Pele ou
 * aplicar o combo fora de Completo + estofos.
 */

export interface ExtraOrcamento {
  descricao: string;
  preco: number;
}

export interface ResultadoPreco {
  precoBase: number;
  precoEstofos: number;
  comboAplicado: boolean;
  descontoCombo: number;
  totalExtras: number;
  precoEntrada: number;
}

export function materialParaTier(material: MaterialBancos): EstofosMaterial | null {
  switch (material) {
    case "pele":
    case "sintetico":
      return "pele_sintetico";
    case "tecido":
    case "alcantara":
      return "tecido_alcantara";
    default:
      return null;
  }
}

export function calcularPrecoOrcamento(params: {
  pacote: Pacote;
  temEstofos: boolean;
  estofosMaterial: EstofosMaterial | null;
  extras: ExtraOrcamento[];
  precos: ConfiguracaoPrecos;
}): ResultadoPreco {
  const { pacote, temEstofos, estofosMaterial, extras, precos } = params;

  const precoBase =
    pacote === "inicial"
      ? precos.preco_inicial
      : pacote === "detalhe"
        ? precos.preco_detalhe
        : precos.preco_completo;

  const precoEstofos = temEstofos
    ? estofosMaterial === "tecido_alcantara"
      ? precos.preco_tecido_alcantara
      : precos.preco_pele_sintetico
    : 0;

  // Regra inegociável: o combo de 10€ só se aplica a Completo + estofos.
  const comboAplicado = pacote === "completo" && temEstofos;
  const descontoCombo = comboAplicado ? precos.desconto_combo : 0;

  const totalExtras = extras.reduce((soma, extra) => soma + (extra.preco || 0), 0);

  const precoEntrada = precoBase + precoEstofos - descontoCombo + totalExtras;

  return { precoBase, precoEstofos, comboAplicado, descontoCombo, totalExtras, precoEntrada };
}

/**
 * Verifica se a tabela de preços editável no Supabase ainda respeita a
 * regra "Tecido/Alcântara custa sempre mais que Pele/Sintético". Usado
 * para mostrar um aviso na app caso alguém edite os preços diretamente
 * na tabela e inverta os valores por engano.
 */
export function precosInvertidos(precos: ConfiguracaoPrecos): boolean {
  return precos.preco_tecido_alcantara <= precos.preco_pele_sintetico;
}

export function formatarEuros(valor: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(valor);
}
