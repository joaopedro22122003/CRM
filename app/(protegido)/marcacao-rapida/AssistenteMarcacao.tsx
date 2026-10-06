"use client";

import { useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import { pt } from "date-fns/locale";
import { Botao, Campo, Cartao, Input, Select, Textarea } from "@/components/ui";
import CalendarioMes from "@/components/CalendarioMes";
import { calcularPrecoOrcamento, formatarEuros, materialDefinido, extraJaIncluidoNoPacote } from "@/lib/pricing";
import {
  ROTULOS_MATERIAL_BANCOS,
  type ConfiguracaoPrecos,
  type ExtraCatalogo,
  type Fonte,
  type MaterialBancos,
  type Pacote,
  type TipoMarcacao,
} from "@/lib/types";
import { criarMarcacaoRapidaAction } from "./actions";
import type { ClienteComViaturas } from "@/lib/data/clientes";
import type { MarcacaoResumo } from "@/lib/data/marcacoes";

const PASSOS = ["Cliente", "Viatura", "Orçamento", "Marcação", "Revisão"] as const;

const PACOTES: { valor: Pacote; rotulo: string }[] = [
  { valor: "inicial", rotulo: "Inicial" },
  { valor: "detalhe", rotulo: "Detalhe" },
  { valor: "completo", rotulo: "Completo" },
];

const HORARIOS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
];

export default function AssistenteMarcacao({
  clientes,
  precos,
  extrasCatalogo,
  marcacoes,
}: {
  clientes: ClienteComViaturas[];
  precos: ConfiguracaoPrecos;
  extrasCatalogo: ExtraCatalogo[];
  marcacoes: MarcacaoResumo[];
}) {
  const [passo, setPasso] = useState(1);
  const [erro, setErro] = useState<string | null>(null);
  const [aEnviar, setAEnviar] = useState(false);

  // Passo 1 — cliente
  const [modoCliente, setModoCliente] = useState<"existente" | "novo">("existente");
  const [pesquisaCliente, setPesquisaCliente] = useState("");
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [novaFonte, setNovaFonte] = useState<Fonte>("instagram");

  // Passo 2 — viatura
  const [modoViatura, setModoViatura] = useState<"existente" | "novo">("novo");
  const [viaturaId, setViaturaId] = useState<string | null>(null);
  const [novaMarca, setNovaMarca] = useState("");
  const [novoModelo, setNovoModelo] = useState("");
  const [novaMatricula, setNovaMatricula] = useState("");
  const [novoMaterial, setNovoMaterial] = useState<MaterialBancos>("por_definir");

  // Passo 3 — orçamento
  const [pacote, setPacote] = useState<Pacote>("inicial");
  const [temEstofos, setTemEstofos] = useState(false);
  const [extrasSelecionados, setExtrasSelecionados] = useState<Set<string>>(new Set());
  const [resumoProblema, setResumoProblema] = useState("");
  const [notasVariacao, setNotasVariacao] = useState("");

  // Passo 4 — marcação
  const [mesCalendario, setMesCalendario] = useState(new Date());
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [hora, setHora] = useState("");
  const [duracaoMin, setDuracaoMin] = useState(90);
  const [tipoMarcacao, setTipoMarcacao] = useState<TipoMarcacao>("cliente_traz");
  const [zona, setZona] = useState("");
  const [notasMarcacao, setNotasMarcacao] = useState("");

  const clienteSelecionado = clientes.find((c) => c.id === clienteId) ?? null;
  const viaturasDoCliente = clienteSelecionado?.viaturas ?? [];
  const viaturaSelecionada = viaturasDoCliente.find((v) => v.id === viaturaId) ?? null;

  const materialEfetivo: MaterialBancos | null =
    modoViatura === "existente" ? (viaturaSelecionada?.material_bancos ?? null) : novoMaterial;
  const estofosDisponiveis = materialEfetivo !== null && materialDefinido(materialEfetivo);

  const extrasDisponiveis = useMemo(
    () => extrasCatalogo.filter((e) => !extraJaIncluidoNoPacote(pacote, e.descricao)),
    [extrasCatalogo, pacote]
  );

  const extras = useMemo(
    () =>
      extrasDisponiveis
        .filter((e) => extrasSelecionados.has(e.id))
        .map((e) => ({ descricao: e.descricao, preco: Number(e.preco) })),
    [extrasDisponiveis, extrasSelecionados]
  );

  const resultado = useMemo(
    () =>
      calcularPrecoOrcamento({
        pacote,
        temEstofos: temEstofos && estofosDisponiveis,
        extras,
        precos,
      }),
    [pacote, temEstofos, estofosDisponiveis, extras, precos]
  );

  function alternarExtra(id: string) {
    setExtrasSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  const clientesFiltrados = (
    pesquisaCliente
      ? clientes.filter(
          (c) =>
            c.nome.toLowerCase().includes(pesquisaCliente.toLowerCase()) ||
            c.telefone.includes(pesquisaCliente)
        )
      : clientes
  ).slice(0, 20);

  const passo1Valido =
    modoCliente === "existente" ? clienteId !== null : novoNome.trim() !== "" && novoTelefone.trim() !== "";

  const passo2Valido =
    modoViatura === "existente" ? viaturaId !== null : novaMarca.trim() !== "" && novoModelo.trim() !== "";

  const passo4Valido =
    dataSelecionada !== null && hora !== "" && (tipoMarcacao !== "recolha_entrega" || zona.trim() !== "");

  function contarMarcacoesNoDia(dia: Date): number {
    return marcacoes.filter((m) => isSameDay(new Date(m.data_hora), dia)).length;
  }

  function selecionarCliente(id: string) {
    setClienteId(id);
    const cliente = clientes.find((c) => c.id === id);
    if (cliente && cliente.viaturas.length > 0) {
      setModoViatura("existente");
      setViaturaId(null);
    } else {
      setModoViatura("novo");
    }
  }

  function seguinte() {
    setErro(null);
    setPasso((p) => Math.min(p + 1, PASSOS.length));
  }

  function voltar() {
    setErro(null);
    setPasso((p) => Math.max(p - 1, 1));
  }

  async function confirmar() {
    setErro(null);
    setAEnviar(true);

    const resultadoAction = await criarMarcacaoRapidaAction({
      cliente:
        modoCliente === "existente"
          ? { modo: "existente", id: clienteId as string }
          : { modo: "novo", nome: novoNome.trim(), telefone: novoTelefone.trim(), fonte: novaFonte },
      viatura:
        modoViatura === "existente"
          ? { modo: "existente", id: viaturaId as string }
          : {
              modo: "novo",
              marca: novaMarca.trim(),
              modelo: novoModelo.trim(),
              matricula: novaMatricula.trim() || null,
              materialBancos: novoMaterial,
            },
      pacote,
      temEstofos: temEstofos && estofosDisponiveis,
      extras,
      resumoProblema: resumoProblema.trim() || null,
      notasVariacao: notasVariacao.trim() || null,
      marcacao: {
        data: dataSelecionada ? format(dataSelecionada, "yyyy-MM-dd") : "",
        hora,
        duracaoMin,
        tipo: tipoMarcacao,
        zona: tipoMarcacao === "recolha_entrega" ? zona.trim() : null,
        notas: notasMarcacao.trim() || null,
      },
    });

    if (resultadoAction?.erro) {
      setErro(resultadoAction.erro);
      setAEnviar(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-28">
      <BarraProgresso passoAtual={passo} />

      {passo === 1 && (
        <Cartao className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-neutral-900">Quem é o cliente?</h2>
          <div className="flex gap-2">
            <Botao
              type="button"
              variante={modoCliente === "existente" ? "primario" : "secundario"}
              className="flex-1 text-sm"
              onClick={() => setModoCliente("existente")}
            >
              Já é cliente
            </Botao>
            <Botao
              type="button"
              variante={modoCliente === "novo" ? "primario" : "secundario"}
              className="flex-1 text-sm"
              onClick={() => {
                setModoCliente("novo");
                setClienteId(null);
                setModoViatura("novo");
                setViaturaId(null);
              }}
            >
              Cliente novo
            </Botao>
          </div>

          {modoCliente === "existente" ? (
            <div className="flex flex-col gap-2">
              <Input
                type="search"
                value={pesquisaCliente}
                onChange={(e) => setPesquisaCliente(e.target.value)}
                placeholder="Pesquisar por nome ou telemóvel…"
              />
              <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                {clientesFiltrados.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => selecionarCliente(c.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
                        clienteId === c.id ? "border-brand bg-brand-50" : "border-neutral-200"
                      }`}
                    >
                      <span>
                        <span className="block font-medium text-neutral-900">{c.nome}</span>
                        <span className="block text-sm text-neutral-500">{c.telefone}</span>
                      </span>
                      {c.viaturas.length > 0 && (
                        <span className="shrink-0 text-xs text-neutral-400">
                          {c.viaturas.length} viatura{c.viaturas.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
                {clientesFiltrados.length === 0 && (
                  <p className="py-4 text-center text-sm text-neutral-500">Nenhum cliente encontrado.</p>
                )}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Campo label="Nome">
                <Input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} autoFocus />
              </Campo>
              <Campo label="Contacto (telemóvel)">
                <Input type="tel" value={novoTelefone} onChange={(e) => setNovoTelefone(e.target.value)} />
              </Campo>
              <Campo label="Como te encontrou">
                <Select value={novaFonte} onChange={(e) => setNovaFonte(e.target.value as Fonte)}>
                  <option value="instagram">Instagram</option>
                  <option value="passa_palavra">Passa-palavra</option>
                  <option value="outro">Outro</option>
                </Select>
              </Campo>
            </div>
          )}
        </Cartao>
      )}

      {passo === 2 && (
        <Cartao className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-neutral-900">Qual é a viatura?</h2>

          {viaturasDoCliente.length > 0 && (
            <div className="flex gap-2">
              <Botao
                type="button"
                variante={modoViatura === "existente" ? "primario" : "secundario"}
                className="flex-1 text-sm"
                onClick={() => setModoViatura("existente")}
              >
                Viatura já registada
              </Botao>
              <Botao
                type="button"
                variante={modoViatura === "novo" ? "primario" : "secundario"}
                className="flex-1 text-sm"
                onClick={() => setModoViatura("novo")}
              >
                Viatura nova
              </Botao>
            </div>
          )}

          {modoViatura === "existente" && viaturasDoCliente.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {viaturasDoCliente.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => setViaturaId(v.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
                      viaturaId === v.id ? "border-brand bg-brand-50" : "border-neutral-200"
                    }`}
                  >
                    <span className="font-medium text-neutral-900">
                      {v.marca} {v.modelo}
                    </span>
                    <span className="text-xs text-neutral-400">{ROTULOS_MATERIAL_BANCOS[v.material_bancos]}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col gap-4">
              <Campo label="Marca">
                <Input value={novaMarca} onChange={(e) => setNovaMarca(e.target.value)} autoFocus />
              </Campo>
              <Campo label="Modelo">
                <Input value={novoModelo} onChange={(e) => setNovoModelo(e.target.value)} />
              </Campo>
              <Campo label="Matrícula (opcional)">
                <Input value={novaMatricula} onChange={(e) => setNovaMatricula(e.target.value)} />
              </Campo>
            </div>
          )}
        </Cartao>
      )}

      {passo === 3 && (
        <Cartao className="flex flex-col gap-5">
          <h2 className="text-base font-semibold text-neutral-900">Orçamento</h2>

          <div className="flex flex-col gap-2">
            {PACOTES.map((p) => (
              <label
                key={p.valor}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                  pacote === p.valor ? "border-brand bg-brand-50" : "border-neutral-200"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={pacote === p.valor}
                    onChange={() => setPacote(p.valor)}
                    className="h-4 w-4"
                  />
                  <span className="font-medium text-neutral-900">{p.rotulo}</span>
                </span>
                <span className="text-sm font-semibold text-neutral-700">
                  desde {formatarEuros(precos[`preco_${p.valor}` as keyof ConfiguracaoPrecos] as number)}
                </span>
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 px-4 py-3">
            <label className="flex items-center justify-between gap-3">
              <span className="font-medium text-neutral-900">Limpeza de estofos</span>
              <input
                type="checkbox"
                checked={temEstofos}
                disabled={modoViatura === "existente" && !estofosDisponiveis}
                onChange={(e) => setTemEstofos(e.target.checked)}
                className="h-5 w-5"
              />
            </label>

            {modoViatura === "existente" && !estofosDisponiveis && (
              <p className="text-xs text-amber-700">
                Define o material dos bancos na ficha da viatura para orçamentar estofos.
              </p>
            )}

            {temEstofos && modoViatura === "novo" && (
              <Campo label="Material dos bancos">
                <Select value={novoMaterial} onChange={(e) => setNovoMaterial(e.target.value as MaterialBancos)}>
                  <option value="por_definir">Por definir</option>
                  <option value="pele">Pele</option>
                  <option value="sintetico">Sintético</option>
                  <option value="tecido">Tecido</option>
                  <option value="alcantara">Alcântara</option>
                </Select>
              </Campo>
            )}

            {temEstofos && !estofosDisponiveis && modoViatura === "novo" && (
              <p className="text-xs text-amber-700">Escolhe o material para o preço dos estofos entrar no orçamento.</p>
            )}

            {temEstofos && estofosDisponiveis && (
              <p className="text-sm text-neutral-600">
                Material: {ROTULOS_MATERIAL_BANCOS[materialEfetivo as MaterialBancos]} — desde{" "}
                {formatarEuros(resultado.precoEstofos)}
              </p>
            )}
          </div>

          {extrasDisponiveis.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-neutral-700">Extras (opcional)</span>
              {pacote === "completo" && (
                <p className="text-xs text-neutral-500">
                  O pacote Completo já inclui cera líquida, renovação de plásticos e remoção de calcário.
                </p>
              )}
              {extrasDisponiveis.map((extra) => {
                const selecionado = extrasSelecionados.has(extra.id);
                return (
                  <label
                    key={extra.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                      selecionado ? "border-brand bg-brand-50" : "border-neutral-200"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selecionado}
                        onChange={() => alternarExtra(extra.id)}
                        className="h-4 w-4"
                      />
                      <span className="font-medium text-neutral-900">{extra.descricao}</span>
                    </span>
                    <span className="text-sm font-semibold text-neutral-700">{formatarEuros(Number(extra.preco))}</span>
                  </label>
                );
              })}
            </div>
          )}

          <Campo label="Resumo do pedido (opcional)">
            <Textarea
              value={resumoProblema}
              onChange={(e) => setResumoProblema(e.target.value)}
              rows={2}
              placeholder="Ex.: quer limpeza de estofos, carro com cheiro a fumo…"
            />
          </Campo>

          <Campo label="Notas de variação esperada (opcional)">
            <Textarea
              value={notasVariacao}
              onChange={(e) => setNotasVariacao(e.target.value)}
              rows={2}
              placeholder="Ex.: preço final pode subir se o carro estiver muito sujo…"
            />
          </Campo>

          <div className="flex flex-col gap-1.5 rounded-xl bg-brand-950 px-4 py-4 text-white">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Preço de entrada</span>
              <span>{formatarEuros(resultado.precoEntrada)}</span>
            </div>
          </div>
        </Cartao>
      )}

      {passo === 4 && (
        <Cartao className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-neutral-900">Escolhe o dia</h2>
          <CalendarioMes
            mesAtual={mesCalendario}
            onMudarMes={setMesCalendario}
            diaSelecionado={dataSelecionada}
            onSelecionarDia={(dia) => {
              setDataSelecionada(dia);
              setMesCalendario(dia);
            }}
            contarEventosNoDia={contarMarcacoesNoDia}
          />

          <div className="flex flex-col gap-2 border-t border-neutral-100 pt-4">
            <span className="text-sm font-medium text-neutral-700">Hora</span>
            <div className="grid grid-cols-3 gap-2">
              {HORARIOS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHora(h)}
                  className={`rounded-xl border px-2 py-2.5 text-sm font-medium ${
                    hora === h ? "border-brand bg-brand-50 text-brand-300" : "border-neutral-200 text-neutral-700"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <Campo label="Duração estimada (minutos)">
            <Input
              type="number"
              step={15}
              min={30}
              value={duracaoMin}
              onChange={(e) => setDuracaoMin(Number(e.target.value))}
            />
          </Campo>
          <Campo label="Tipo">
            <Select value={tipoMarcacao} onChange={(e) => setTipoMarcacao(e.target.value as TipoMarcacao)}>
              <option value="cliente_traz">Cliente traz o carro</option>
              <option value="recolha_entrega">Recolha / entrega</option>
            </Select>
          </Campo>
          {tipoMarcacao === "recolha_entrega" && (
            <Campo label="Zona">
              <Input value={zona} onChange={(e) => setZona(e.target.value)} placeholder="Ex.: Terras de Bouro" />
            </Campo>
          )}
          <Campo label="Notas (opcional)">
            <Textarea value={notasMarcacao} onChange={(e) => setNotasMarcacao(e.target.value)} rows={2} />
          </Campo>
        </Cartao>
      )}

      {passo === 5 && (
        <Cartao className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-neutral-900">Confirmar</h2>

          <LinhaRevisao
            rotulo="Cliente"
            valor={modoCliente === "existente" ? (clienteSelecionado?.nome ?? "") : `${novoNome} (novo)`}
          />
          <LinhaRevisao
            rotulo="Viatura"
            valor={
              modoViatura === "existente"
                ? `${viaturaSelecionada?.marca ?? ""} ${viaturaSelecionada?.modelo ?? ""}`
                : `${novaMarca} ${novoModelo} (nova)`
            }
          />
          <LinhaRevisao
            rotulo="Orçamento"
            valor={`${PACOTES.find((p) => p.valor === pacote)?.rotulo}${temEstofos && estofosDisponiveis ? " + Estofos" : ""}${
              extras.length > 0 ? ` · ${extras.map((e) => e.descricao).join(", ")}` : ""
            }`}
          />
          <LinhaRevisao rotulo="Preço de entrada" valor={formatarEuros(resultado.precoEntrada)} />
          <LinhaRevisao
            rotulo="Marcação"
            valor={`${dataSelecionada ? format(dataSelecionada, "EEEE, d 'de' MMMM", { locale: pt }) : ""} às ${hora} · ${
              tipoMarcacao === "recolha_entrega" ? `Recolha/entrega (${zona})` : "Cliente traz o carro"
            }`}
          />
        </Cartao>
      )}

      {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

      <div className="fixed inset-x-0 bottom-16 z-10 mx-auto flex max-w-lg gap-2 border-t border-neutral-200 bg-neutral-100/95 p-3 backdrop-blur">
        {passo > 1 && (
          <Botao type="button" variante="secundario" className="flex-1" onClick={voltar}>
            Voltar
          </Botao>
        )}
        {passo < PASSOS.length ? (
          <Botao
            type="button"
            className="flex-1"
            disabled={(passo === 1 && !passo1Valido) || (passo === 2 && !passo2Valido) || (passo === 4 && !passo4Valido)}
            onClick={seguinte}
          >
            Seguinte
          </Botao>
        ) : (
          <Botao type="button" className="flex-1" disabled={aEnviar} onClick={confirmar}>
            {aEnviar ? "A confirmar…" : "Confirmar marcação"}
          </Botao>
        )}
      </div>
    </div>
  );
}

function BarraProgresso({ passoAtual }: { passoAtual: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        {PASSOS.map((_, indice) => (
          <div
            key={indice}
            className={`h-1.5 flex-1 rounded-full ${indice < passoAtual ? "bg-brand" : "bg-neutral-200"}`}
          />
        ))}
      </div>
      <p className="text-xs text-neutral-500">
        Passo {passoAtual} de {PASSOS.length} · {PASSOS[passoAtual - 1]}
      </p>
    </div>
  );
}

function LinhaRevisao({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="border-b border-neutral-100 pb-2">
      <p className="text-xs text-neutral-500">{rotulo}</p>
      <p className="font-medium text-neutral-900">{valor}</p>
    </div>
  );
}
