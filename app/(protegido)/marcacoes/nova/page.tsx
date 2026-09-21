import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Cartao, EstadoVazio } from "@/components/ui";
import { obterPedidoComDetalhe, listarPedidosAbertos } from "@/lib/data/pedidos";
import MarcacaoForm from "../MarcacaoForm";

export default async function NovaMarcacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido_id?: string }>;
}) {
  const { pedido_id } = await searchParams;

  if (!pedido_id) {
    const pedidos = await listarPedidosAbertos();
    return (
      <>
        <PageHeader titulo="Nova marcação" voltarPara="/marcacoes" />
        <div className="flex flex-col gap-3 p-4">
          <p className="text-sm text-neutral-500">Escolhe o pedido para marcar.</p>
          {pedidos.length === 0 ? (
            <EstadoVazio titulo="Sem pedidos em aberto" descricao="Cria primeiro um pedido." />
          ) : (
            <ul className="flex flex-col gap-2">
              {pedidos.map((pedido) => (
                <li key={pedido.id}>
                  <Link href={`/marcacoes/nova?pedido_id=${pedido.id}`}>
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

  return (
    <>
      <PageHeader titulo={`Marcar — ${detalhe.cliente.nome}`} voltarPara={`/pedidos/${pedido_id}`} />
      <div className="p-4">
        <Cartao>
          <MarcacaoForm pedidoId={pedido_id} />
        </Cartao>
      </div>
    </>
  );
}
