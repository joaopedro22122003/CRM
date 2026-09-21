"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { guardarOrcamento, type EstadoFormulario } from "./actions";
import { Botao, Campo, Textarea } from "@/components/ui";
import { calcularPrecoOrcamento, materialParaTier, precosInvertidos, formatarEuros, type ExtraOrcamento } from "@/lib/pricing";
import { ROTULOS_MATERIAL_BANCOS, type ConfiguracaoPrecos, type MaterialBancos, type Pacote } from "@/lib/types";

const ESTADO_INICIAL: EstadoFormulario = {};

const PACOTES: { valor: Pacote; rotulo: string; descricao: string }[] = [
  { valor: "inicial", rotulo: "Inicial", descricao: "Limpeza rápida por fora e por dentro" },
  { valor: "detalhe", rotulo: "Detalhe", descricao: "Limpeza cuidada, mais tempo de trabalho" },
  { valor: "completo", rotulo: "Completo", descricao: "Tratamento completo interior e exterior" },
];

export default function OrcamentoForm({
  pedidoId,
  materialBancos,
  precos,
}: {
  pedidoId: string;
  materialBancos: MaterialBancos | null;
  precos: ConfiguracaoPrecos;
}) {
  const [estado, formAction, aPendente] = useActionState(guardarOrcamento, ESTADO_INICIAL);

  const [pacote, setPacote] = useState<Pacote>("inicial");
  const [temEstofos, setTemEstofos] = useState(false);
  const [extras, setExtras] = useState<ExtraOrcamento[]>([]);
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novoPreco, setNovoPreco] = useState("");

  const materialTier = materialBancos ? materialParaTier(materialBancos) : null;
  const estofosDisponiveis = materialTier !== null;
  const avisoPrecos = precosInvertidos(precos);

  const resultado = useMemo(
    () =>
      calcularPrecoOrcamento({
        pacote,
        temEstofos: temEstofos && estofosDisponiveis,
        estofosMaterial: temEstofos && estofosDisponiveis ? materialTier : null,
        extras,
        precos,
      }),
    [pacote, temEstofos, estofosDisponiveis, materialTier, extras, precos]
  );

  function adicionarExtra() {
    const descricao = novaDescricao.trim();
    const preco = Number(novoPreco);
    if (!descricao || Number.isNaN(preco)) return;
    setExtras((atual) => [...atual, { descricao, preco }]);
    setNovaDescricao("");
    setNovoPreco("");
  }

  function removerExtra(indice: number) {
    setExtras((atual) => atual.filter((_, i) => i !== indice));
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="pedido_id" value={pedidoId} />
      <input type="hidden" name="pacote" value={pacote} />
      <input type="hidden" name="extras" value={JSON.stringify(extras)} readOnly />

      {avisoPrecos && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Atenção: na tabela de preços, Tecido/Alcântara não está mais caro que Pele/Sintético. Corrige isto na
          tabela de configuração de preços.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-700">Pacote</span>
        <div className="flex flex-col gap-2">
          {PACOTES.map((p) => (
            <label
              key={p.valor}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                pacote === p.valor ? "border-neutral-900 bg-neutral-50" : "border-neutral-200"
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="pacote_ui"
                  value={p.valor}
                  checked={pacote === p.valor}
                  onChange={() => setPacote(p.valor)}
                  className="h-4 w-4"
                />
                <span>
                  <span className="block font-medium text-neutral-900">{p.rotulo}</span>
                  <span className="block text-xs text-neutral-500">{p.descricao}</span>
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-neutral-700">
                desde {formatarEuros(precos[`preco_${p.valor}` as keyof ConfiguracaoPrecos] as number)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 px-4 py-3">
        <label className="flex items-center justify-between gap-3">
          <span className="font-medium text-neutral-900">Limpeza de estofos</span>
          <input
            type="checkbox"
            name="tem_estofos"
            checked={temEstofos}
            disabled={!estofosDisponiveis}
            onChange={(e) => setTemEstofos(e.target.checked)}
            className="h-5 w-5"
          />
        </label>
        {estofosDisponiveis ? (
          temEstofos && (
            <p className="text-sm text-neutral-600">
              Material: {ROTULOS_MATERIAL_BANCOS[materialBancos as MaterialBancos]} — desde{" "}
              {formatarEuros(resultado.precoEstofos)}
            </p>
          )
        ) : (
          <p className="text-xs text-amber-700">
            Define primeiro o material dos bancos na ficha da viatura para poderes orçamentar estofos.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-700">Extras (opcional)</span>
        {extras.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {extras.map((extra, indice) => (
              <li key={indice} className="flex items-center justify-between rounded-lg bg-neutral-100 px-3 py-2 text-sm">
                <span>{extra.descricao}</span>
                <span className="flex items-center gap-2">
                  <span className="font-medium">{formatarEuros(extra.preco)}</span>
                  <button
                    type="button"
                    onClick={() => removerExtra(indice)}
                    aria-label="Remover extra"
                    className="text-neutral-400"
                  >
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={novaDescricao}
            onChange={(e) => setNovaDescricao(e.target.value)}
            placeholder="Descrição (ex.: descontaminação)"
            className="flex-1 rounded-xl border border-neutral-300 px-3 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
          />
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={novoPreco}
            onChange={(e) => setNovoPreco(e.target.value)}
            placeholder="€"
            className="w-20 rounded-xl border border-neutral-300 px-3 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
          />
          <button
            type="button"
            onClick={adicionarExtra}
            className="shrink-0 rounded-xl bg-neutral-100 px-3 py-2.5 text-sm font-semibold text-neutral-700"
          >
            + Add
          </button>
        </div>
      </div>

      <Campo label="Notas de variação esperada (opcional)">
        <Textarea
          name="notas_variacao"
          rows={2}
          placeholder="Ex.: preço final pode subir se o carro estiver muito sujo…"
        />
      </Campo>

      <div className="flex flex-col gap-1.5 rounded-xl bg-neutral-900 px-4 py-4 text-white">
        <LinhaResumo rotulo="Pacote" valor={resultado.precoBase} />
        {resultado.precoEstofos > 0 && <LinhaResumo rotulo="Estofos" valor={resultado.precoEstofos} />}
        {resultado.comboAplicado && <LinhaResumo rotulo="Desconto combo" valor={-resultado.descontoCombo} />}
        {resultado.totalExtras > 0 && <LinhaResumo rotulo="Extras" valor={resultado.totalExtras} />}
        <div className="flex items-center justify-between border-t border-white/20 pt-1.5 text-lg font-bold">
          <span>Preço de entrada</span>
          <span>{formatarEuros(resultado.precoEntrada)}</span>
        </div>
      </div>

      {estado?.erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{estado.erro}</p>
      )}

      <Botao disabled={aPendente} className="w-full">
        {aPendente ? "A guardar…" : "Criar orçamento"}
      </Botao>
    </form>
  );
}

function LinhaResumo({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="flex items-center justify-between text-sm text-neutral-200">
      <span>{rotulo}</span>
      <span>
        {valor < 0 ? "-" : ""}
        {formatarEuros(Math.abs(valor))}
      </span>
    </div>
  );
}
