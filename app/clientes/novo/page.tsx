import { PageHeader, Cartao } from "@/components/ui";
import ClienteForm from "../ClienteForm";

export default function NovoClientePage() {
  return (
    <>
      <PageHeader titulo="Novo cliente" voltarPara="/clientes" />
      <div className="p-4">
        <Cartao>
          <ClienteForm />
        </Cartao>
      </div>
    </>
  );
}
