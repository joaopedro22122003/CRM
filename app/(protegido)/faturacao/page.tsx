import Link from "next/link";
import { PageHeader, Cartao, Badge, Botao, EstadoVazio } from "@/components/ui";
import { listarFaturacao } from "@/lib/data/faturacao";
import { mudarEstadoFaturacaoAction } from "../servicos/actions";
import { formatarEuros } from "@/lib/pricing";

export default async function FaturacaoPage() {
  const registos = await listarFaturacao();
  const totalPendente = registos.filter((r) => r.estado === "pendente").reduce((s, r) => s + Number(r.valor), 0);

  return (
    <>
      <PageHeader titulo="Faturação" voltarPara="/mais" />

      <div className="flex flex-col gap-4 p-4">
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
