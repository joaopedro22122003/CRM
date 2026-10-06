import { PageHeader, Cartao } from "@/components/ui";
import DespesaForm from "../DespesaForm";

export default function NovaDespesaPage() {
  return (
    <>
      <PageHeader titulo="Nova despesa" voltarPara="/despesas" />
      <div className="p-4">
        <Cartao>
          <DespesaForm />
        </Cartao>
      </div>
    </>
  );
}
