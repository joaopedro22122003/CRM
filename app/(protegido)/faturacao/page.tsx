import Link from "next/link";
import { PageHeader, Cartao, Badge, Botao, EstadoVazio } from "@/components/ui";
import { listarFaturacao } from "@/lib/data/faturacao";
import { listarDespesas } from "@/lib/data/despesas";
import { mudarEstadoFaturacaoAction } from "../servicos/actions";
import { formatarEuros } from "@/lib/pricing";

export default async function FaturacaoPage() {
  const [registos, despesas] = await Promise.all([listarFaturacao(), listarDespesas()]);

  const totalRecebido = registos.filter((r) => r.estado === "pago").reduce((s, r) => s + Number(r.valor), 0);
  const totalPendente = registos.filter((r) => r.estado === "pendente").reduce((s, r) => s + Number(r.valor), 0);
  const totalDespesas = despesas.reduce((s, d) => s + Number(d.valor), 0);
  const lucro = totalRecebido - totalDespesas;

  return (
    <>
      <PageHeader titulo="Faturação" voltarPara="/mais" />

      <div className="flex flex-col gap-4 p-4">
        {(registos.length > 0 || despesas.length > 0) && (
          <>
            <Cartao
              className={`flex flex-col items-center gap-1 py-5 text-center ${
                lucro >= 0 ? "border-brand bg-brand-50" : "border-red-700/30 bg-red-50"
              }`}
            >
              <span className={`text-sm font-medium ${lucro >= 0 ? "text-brand-300" : "text-red-700"}`}>
                Lucro (recebido − despesas)
              </span>
              <span className="text-3xl font-bold text-neutral-900">{formatarEuros(lucro)}</span>
            </Cartao>

            <div className="grid grid-cols-2 gap-3">
              <Cartao className="flex flex-col items-center gap-1 py-4 text-center">
                <span className="text-xs font-medium text-neutral-500">Recebido</span>
                <span className="text-lg font-bold text-neutral-900">{formatarEuros(totalRecebido)}</span>
              </Cartao>
              <Cartao className="flex flex-col items-center gap-1 py-4 text-center">
                <span className="text-xs font-medium text-neutral-500">Despesas</span>
                <span className="text-lg font-bold text-neutral-900">{formatarEuros(totalDespesas)}</span>
              </Cartao>
            </div>
          </>
        )}

        {totalPendente > 0 && (
          <Cartao className="flex items-center justify-between bg-amber-50">
            <span className="text-sm font-medium text-amber-800">Total por receber</span>
            <span className="text-lg font-bold text-amber-900">{formatarEuros(totalPendente)}</span>
          </Cartao>
        )}

        {registos.length === 0 ? (
          <EstadoVazio titulo="Ainda sem pagamentos registados" />
        ) : (
          <ul className="flex flex-col gap-2">
            {registos.map((r) => (
              <li key={r.id}>
                <Cartao className="flex items-center justify-between gap-3">
                  <Link href={`/servicos/${r.servico.id}`} className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-neutral-900">{r.servico.cliente.nome}</p>
                    <p className="text-sm text-neutral-500">
                      {new Date(r.servico.data_conclusao).toLocaleDateString("pt-PT")} · {formatarEuros(Number(r.valor))}
                    </p>
                    {r.orcamento && (
                      <p className="truncate text-xs text-neutral-400">
                        {r.orcamento.pacote}
                        {r.orcamento.temEstofos && " + Estofos"}
                        {r.orcamento.extras.length > 0 && ` · ${r.orcamento.extras.join(", ")}`}
                      </p>
                    )}
                  </Link>
                  {r.estado === "pago" ? (
                    <Badge cor="verde">Pago</Badge>
                  ) : (
                    <form action={mudarEstadoFaturacaoAction}>
                      <input type="hidden" name="faturacao_id" value={r.id} />
                      <input type="hidden" name="estado" value="pago" />
                      <Botao variante="secundario" className="px-3 py-2 text-sm">
                        Marcar pago
                      </Botao>
                    </form>
                  )}
                </Cartao>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
