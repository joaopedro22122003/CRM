import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Cartao, BotaoLink, EstadoVazio, Badge } from "@/components/ui";
import { obterClienteComDetalhe } from "@/lib/data/clientes";
import { ROTULOS_FONTE, ROTULOS_MATERIAL_BANCOS } from "@/lib/types";
import { formatarEuros } from "@/lib/pricing";
import { linkWhatsApp } from "@/lib/whatsapp";

export default async function ClienteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detalhe = await obterClienteComDetalhe(id);
  if (!detalhe) notFound();

  const { cliente, viaturas, servicos, totalGasto, ultimaData } = detalhe;

  return (
    <>
      <PageHeader
        titulo={cliente.nome}
        voltarPara="/clientes"
        acao={
          <Link
            href={`/clientes/${cliente.id}/editar`}
            className="flex h-9 items-center rounded-full px-3 text-sm font-semibold text-neutral-600 active:bg-neutral-200"
          >
            Editar
          </Link>
        }
      />

      <div className="flex flex-col gap-4 p-4">
        <Cartao className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Contacto</p>
              <p className="font-medium text-neutral-900">{cliente.telefone}</p>
            </div>
            <a
              href={linkWhatsApp(cliente.telefone)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white active:bg-green-700"
            >
              WhatsApp
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge cor="cinza">{ROTULOS_FONTE[cliente.fonte]}</Badge>
            {ultimaData && <Badge cor="verde">Último serviço: {formatarData(ultimaData)}</Badge>}
          </div>
          {cliente.notas && <p className="text-sm text-neutral-600">{cliente.notas}</p>}
          <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
            <span className="text-sm text-neutral-500">Total gasto</span>
            <span className="text-lg font-bold text-neutral-900">{formatarEuros(totalGasto)}</span>
          </div>
        </Cartao>

        <BotaoLink href={`/pedidos/novo?cliente_id=${cliente.id}`}>+ Novo pedido para este cliente</BotaoLink>

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">Viaturas</h2>
            <Link href={`/clientes/${cliente.id}/viaturas/novo`} className="text-sm font-semibold text-neutral-600">
              + Adicionar
            </Link>
          </div>

          {viaturas.length === 0 ? (
            <EstadoVazio titulo="Sem viaturas registadas" />
          ) : (
            <ul className="flex flex-col gap-2">
              {viaturas.map((viatura) => (
                <li key={viatura.id}>
                  <Link href={`/viaturas/${viatura.id}/editar`}>
                    <Cartao className="flex items-center justify-between active:bg-neutral-50">
                      <div>
                        <p className="font-medium text-neutral-900">
                          {viatura.marca} {viatura.modelo}
                        </p>
                        {viatura.matricula && <p className="text-sm text-neutral-500">{viatura.matricula}</p>}
                      </div>
                      <Badge cor={viatura.material_bancos === "por_definir" ? "amarelo" : "cinza"}>
                        Bancos: {ROTULOS_MATERIAL_BANCOS[viatura.material_bancos]}
                      </Badge>
                    </Cartao>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-neutral-900">Histórico de serviços</h2>
          {servicos.length === 0 ? (
            <EstadoVazio titulo="Ainda sem serviços concluídos" />
          ) : (
            <ul className="flex flex-col gap-2">
              {servicos.map((servico) => (
                <li key={servico.id}>
                  <Link href={`/servicos/${servico.id}`}>
                    <Cartao className="flex items-center justify-between active:bg-neutral-50">
                      <span className="text-sm text-neutral-500">{formatarData(servico.data_conclusao)}</span>
                      <span className="font-semibold text-neutral-900">{formatarEuros(Number(servico.preco_final))}</span>
                    </Cartao>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function formatarData(data: string): string {
  return new Date(data).toLocaleDateString("pt-PT");
}
