import { notFound } from "next/navigation";
import { PageHeader, Cartao } from "@/components/ui";
import { obterPedidoComDetalhe } from "@/lib/data/pedidos";
import { obterConfiguracaoPrecos } from "@/lib/data/precos";
import OrcamentoForm from "./OrcamentoForm";

export default async function OrcamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [detalhe, precos] = await Promise.all([obterPedidoComDetalhe(id), obterConfiguracaoPrecos()]);
  if (!detalhe) notFound();

  return (
    <>
      <PageHeader titulo={`Orçamento — ${detalhe.cliente.nome}`} voltarPara={`/pedidos/${id}`} />
      <div className="p-4">
        <Cartao>
          <OrcamentoForm pedidoId={id} materialBancos={detalhe.viatura?.material_bancos ?? null} precos={precos} />
        </Cartao>
      </div>
    </>
  );
}
