import { PageHeader, Cartao } from "@/components/ui";
import { obterEstatisticasOrcamentos } from "@/lib/data/estatisticas";

export default async function EstatisticasPage() {
  const e = await obterEstatisticasOrcamentos();

  return (
    <>
      <PageHeader titulo="Estatísticas" voltarPara="/mais" />

      <div className="flex flex-col gap-4 p-4">
        <Cartao className="flex flex-col items-center gap-1 py-5 text-center">
          <p className="text-sm font-medium text-neutral-500">Orçamentos registados</p>
          <p className="text-3xl font-bold text-neutral-900">{e.totalRegistados}</p>
          <p className="text-sm text-neutral-500">{e.registadosEsteMes} este mês</p>
        </Cartao>

        <div className="grid grid-cols-3 gap-2">
          <Cartao className="flex flex-col items-center gap-1 py-4 text-center">
            <span className="text-2xl font-bold text-neutral-900">{e.ativos}</span>
            <span className="text-xs font-medium text-neutral-500">Ainda ativos</span>
          </Cartao>
          <Cartao className="flex flex-col items-center gap-1 py-4 text-center">
            <span className="text-2xl font-bold text-neutral-900">{e.marcaram}</span>
            <span className="text-xs font-medium text-neutral-500">Marcaram</span>
          </Cartao>
          <Cartao className="flex flex-col items-center gap-1 py-4 text-center">
            <span className="text-2xl font-bold text-neutral-900">{e.perderam}</span>
            <span className="text-xs font-medium text-neutral-500">Perderam</span>
          </Cartao>
        </div>

        <Cartao className="flex flex-col items-center gap-1 py-5 text-center">
          <p className="text-sm font-medium text-neutral-500">Taxa de conversão</p>
          {e.taxaConversao === null ? (
            <>
              <p className="mt-1 text-lg font-semibold text-neutral-700">Ainda há poucos dados</p>
              <p className="text-sm text-neutral-500">
                {e.marcaram} marcaram, {e.perderam} perderam
              </p>
            </>
          ) : (
            <p className="text-3xl font-bold text-neutral-900">{Math.round(e.taxaConversao * 100)}%</p>
          )}
        </Cartao>

        <p className="text-center text-xs text-neutral-400">Só conta os orçamentos registados aqui.</p>
      </div>
    </>
  );
}
