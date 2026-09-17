import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Cartao, Badge, Select, Input, Botao } from "@/components/ui";
import { obterServicoComDetalhe } from "@/lib/data/servicos";
import { mudarEstadoFaturacaoAction } from "../actions";
import { formatarEuros } from "@/lib/pricing";

export default async function ServicoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detalhe = await obterServicoComDetalhe(id);
  if (!detalhe) notFound();

  const { servico, cliente, viatura, fotos, faturacao } = detalhe;
  const margem = Number(servico.preco_final) - Number(servico.custo_produtos);
  const tempoTotal = (servico.tempo_execucao_min ?? 0) + (servico.tempo_deslocacao_min ?? 0);
  const lucroHora = tempoTotal > 0 ? margem / (tempoTotal / 60) : null;

  const fotosAntes = fotos.filter((f) => f.tipo === "antes");
  const fotosDepois = fotos.filter((f) => f.tipo === "depois");

  return (
    <>
      <PageHeader titulo="Serviço" voltarPara="/servicos" />

      <div className="flex flex-col gap-4 p-4">
        <Cartao className="flex flex-col gap-2">
          <Link href={`/clientes/${cliente.id}`} className="font-semibold text-neutral-900 active:underline">
            {cliente.nome}
          </Link>
          <p className="text-sm text-neutral-600">
            {viatura.marca} {viatura.modelo} · {new Date(servico.data_conclusao).toLocaleDateString("pt-PT")}
          </p>

          <div className="mt-2 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-3 text-sm">
            <Linha rotulo="Preço final" valor={formatarEuros(Number(servico.preco_final))} />
            <Linha rotulo="Custo produtos" valor={formatarEuros(Number(servico.custo_produtos))} />
            <Linha rotulo="Margem" valor={formatarEuros(margem)} />
            {lucroHora !== null && <Linha rotulo="Lucro/hora" valor={formatarEuros(lucroHora)} />}
            {servico.tempo_execucao_min != null && <Linha rotulo="Tempo execução" valor={`${servico.tempo_execucao_min} min`} />}
            {servico.tempo_deslocacao_min > 0 && <Linha rotulo="Tempo deslocação" valor={`${servico.tempo_deslocacao_min} min`} />}
          </div>

          {servico.notas_incidentes && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              ⚠ {servico.notas_incidentes}
            </p>
          )}
        </Cartao>

        {faturacao && (
          <Cartao className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-900">Faturação</h2>
              <Badge cor={faturacao.estado === "pago" ? "verde" : "amarelo"}>
                {faturacao.estado === "pago" ? "Pago" : "Pendente"}
              </Badge>
            </div>
            <form action={mudarEstadoFaturacaoAction} className="flex flex-col gap-2">
              <input type="hidden" name="faturacao_id" value={faturacao.id} />
              <div className="flex gap-2">
                <Select name="estado" defaultValue={faturacao.estado} className="flex-1">
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                </Select>
                <Input
                  name="metodo_pagamento"
                  defaultValue={faturacao.metodo_pagamento ?? ""}
                  placeholder="MBWay, transferência…"
                  className="flex-1"
                />
              </div>
              <Botao variante="secundario" className="w-full text-sm">
                Atualizar pagamento
              </Botao>
            </form>
          </Cartao>
        )}

        {(fotosAntes.length > 0 || fotosDepois.length > 0) && (
          <div className="flex flex-col gap-3">
            {fotosAntes.length > 0 && <GaleriaFotos titulo="Antes" fotos={fotosAntes.map((f) => f.url)} />}
            {fotosDepois.length > 0 && <GaleriaFotos titulo="Depois" fotos={fotosDepois.map((f) => f.url)} />}
          </div>
        )}
      </div>
    </>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-500">{rotulo}</p>
      <p className="font-semibold text-neutral-900">{valor}</p>
    </div>
  );
}

function GaleriaFotos({ titulo, fotos }: { titulo: string; fotos: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-neutral-700">{titulo}</h3>
      <div className="grid grid-cols-3 gap-2">
        {fotos.map((url) => (
          <a key={url} href={url} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element -- URLs remotas do Supabase Storage, sem next/image configurado */}
            <img src={url} alt={titulo} className="aspect-square w-full rounded-xl object-cover" />
          </a>
        ))}
      </div>
    </div>
  );
}
