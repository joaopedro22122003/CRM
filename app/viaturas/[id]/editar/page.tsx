import { notFound } from "next/navigation";
import { PageHeader, Cartao } from "@/components/ui";
import { obterViaturaComCliente } from "@/lib/data/viaturas";
import ViaturaForm from "@/app/clientes/ViaturaForm";

export default async function EditarViaturaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resultado = await obterViaturaComCliente(id);
  if (!resultado) notFound();
  const { viatura, cliente } = resultado;

  return (
    <>
      <PageHeader titulo={`${viatura.marca} ${viatura.modelo}`} voltarPara={`/clientes/${cliente.id}`} />
      <div className="p-4">
        <Cartao>
          <ViaturaForm clienteId={cliente.id} viatura={viatura} />
        </Cartao>
      </div>
    </>
  );
}
