import { notFound } from "next/navigation";
import { PageHeader, Cartao } from "@/components/ui";
import { obterCliente } from "@/lib/data/clientes";
import ViaturaForm from "../../../ViaturaForm";

export default async function NovaViaturaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cliente = await obterCliente(id);
  if (!cliente) notFound();

  return (
    <>
      <PageHeader titulo={`Nova viatura — ${cliente.nome}`} voltarPara={`/clientes/${id}`} />
      <div className="p-4">
        <Cartao>
          <ViaturaForm clienteId={id} />
        </Cartao>
      </div>
    </>
  );
}
