import Link from "next/link";
import { PageHeader, Cartao, EstadoVazio, BotaoLink } from "@/components/ui";
import { listarDespesas } from "@/lib/data/despesas";
import { formatarEuros } from "@/lib/pricing";
import BotaoApagarDespesa from "./BotaoApagarDespesa";

export default async function DespesasPage() {
  const despesas = await listarDespesas();
  const total = despesas.reduce((s, d) => s + Number(d.valor), 0);

  return (
    <>
      <PageHeader
        titulo="Despesas"
        voltarPara="/mais"
        acao={
          <Link
            href="/despesas/nova"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white"
            aria-label="Nova despesa"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
          </Link>
        }
      />

      <div className="flex flex-col gap-4 p-4">
        {despesas.length > 0 && (
          <Cartao className="flex flex-col items-center gap-1 border-red-700/30 bg-red-50 py-5 text-center">
            <span className="text-sm font-medium text-red-700">Total gasto</span>
            <span className="text-3xl font-bold text-neutral-900">{formatarEuros(total)}</span>
          </Cartao>
        )}

        {despesas.length === 0 ? (
          <EstadoVazio
            titulo="Ainda sem despesas registadas"
            descricao="Aponta aqui tudo o que gastas no negócio."
            acao={<BotaoLink href="/despesas/nova">+ Nova despesa</BotaoLink>}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {despesas.map((despesa) => (
              <li key={despesa.id}>
                <Cartao className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-900">{despesa.descricao}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(`${despesa.data}T00:00:00`).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="font-semibold text-neutral-900">{formatarEuros(Number(despesa.valor))}</span>
                    <BotaoApagarDespesa despesaId={despesa.id} descricao={despesa.descricao} />
                  </div>
                </Cartao>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
