import { notFound } from "next/navigation";
import { PageHeader, Cartao } from "@/components/ui";
import { obterCliente } from "@/lib/data/clientes";
import ClienteForm from "../../ClienteForm";

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cliente = await obterCliente(id);
  if (!cliente) notFound();

  return (
    <>
      <PageHeader titulo="Editar cliente" voltarPara={`/clientes/${id}`} />
      <div className="p-4">
        <Cartao>
          <ClienteForm cliente={cliente} />
        </Cartao>
      </div>
    </>
  );
}
