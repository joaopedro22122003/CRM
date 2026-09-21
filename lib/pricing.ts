import type { ConfiguracaoPrecos, MaterialBancos, Pacote } from "./types";

/**
 * Motor central de preços. Todas as regras de negócio inegociáveis da
 * Garagem do Jota vivem aqui — nenhum ecrã calcula preços por fora
 * desta função, para nunca ser possível aplicar o combo fora de
 * Completo + estofos.
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

/** Verifica se o material dos bancos já foi definido na viatura —
 * necessário antes de orçamentar limpeza de estofos. O preço dos
 * estofos é único, independente do material (só regista qual foi). */
export function materialDefinido(material: MaterialBancos): boolean {
  return material !== "por_definir";
}

export function calcularPrecoOrcamento(params: {
  pacote: Pacote;
  temEstofos: boolean;
  extras: ExtraOrcamento[];
  precos: ConfiguracaoPrecos;
}): ResultadoPreco {
  const { pacote, temEstofos, extras, precos } = params;

  const precoBase =
    pacote === "inicial"
      ? precos.preco_inicial
      : pacote === "detalhe"
        ? precos.preco_detalhe
        : precos.preco_completo;

  const precoEstofos = temEstofos ? precos.preco_estofos : 0;

  // Regra inegociável: o combo de 10€ só se aplica a Completo + estofos.
  const comboAplicado = pacote === "completo" && temEstofos;
  const descontoCombo = comboAplicado ? precos.desconto_combo : 0;

  const totalExtras = extras.reduce((soma, extra) => soma + (extra.preco || 0), 0);

  const precoEntrada = precoBase + precoEstofos - descontoCombo + totalExtras;

  return { precoBase, precoEstofos, comboAplicado, descontoCombo, totalExtras, precoEntrada };
}

export function formatarEuros(valor: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(valor);
}
