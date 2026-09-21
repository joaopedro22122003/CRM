import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Cartao, EstadoVazio } from "@/components/ui";
import { obterPedidoComDetalhe, listarPedidosAbertos } from "@/lib/data/pedidos";
import ServicoForm from "../ServicoForm";

export default async function NovoServicoPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido_id?: string; marcacao_id?: string }>;
}) {
  const { pedido_id, marcacao_id } = await searchParams;

  if (!pedido_id) {
    const pedidos = await listarPedidosAbertos();
    return (
      <>
        <PageHeader titulo="Registar serviço" voltarPara="/servicos" />
        <div className="flex flex-col gap-3 p-4">
          <p className="text-sm text-neutral-500">Escolhe o pedido correspondente.</p>
          {pedidos.length === 0 ? (
            <EstadoVazio titulo="Sem pedidos em aberto" />
          ) : (
            <ul className="flex flex-col gap-2">
              {pedidos.map((pedido) => (
                <li key={pedido.id}>
                  <Link href={`/servicos/novo?pedido_id=${pedido.id}`}>
                    <Cartao className="active:bg-neutral-50">
                      <p className="font-semibold text-neutral-900">{pedido.cliente.nome}</p>
                      <p className="text-sm text-neutral-500">
                        {pedido.viatura ? `${pedido.viatura.marca} ${pedido.viatura.modelo}` : "Sem viatura"}
                      </p>
                    </Cartao>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </>
    );
  }

  const detalhe = await obterPedidoComDetalhe(pedido_id);
  if (!detalhe) notFound();

  if (!detalhe.viatura) {
    return (
      <>
        <PageHeader titulo="Registar serviço" voltarPara={`/pedidos/${pedido_id}`} />
        <div className="p-4">
          <EstadoVazio
            titulo="Este pedido ainda não tem viatura associada"
            descricao="Associa uma viatura ao pedido antes de registar o serviço."
          />
        </div>
      </>
    );
  }

  const ultimoOrcamento = detalhe.orcamentos[0];

  return (
    <>
      <PageHeader titulo={`Registar serviço — ${detalhe.cliente.nome}`} voltarPara={`/pedidos/${pedido_id}`} />
      <div className="p-4">
        <Cartao>
          <ServicoForm
            pedidoId={pedido_id}
            marcacaoId={marcacao_id}
            viaturaId={detalhe.viatura.id}
            clienteId={detalhe.cliente.id}
            precoSugerido={ultimoOrcamento ? Number(ultimoOrcamento.preco_entrada) : null}
          />
        </Cartao>
      </div>
    </>
  );
}
