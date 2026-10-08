import { PageHeader, Cartao } from "@/components/ui";
import PedidoRapidoForm from "./PedidoRapidoForm";

export default function PedidoRapidoPage() {
  return (
    <>
      <PageHeader titulo="Pediu preço" voltarPara="/pedidos" />
      <div className="p-4">
        <Cartao>
          <PedidoRapidoForm />
        </Cartao>
      </div>
    </>
  );
}
