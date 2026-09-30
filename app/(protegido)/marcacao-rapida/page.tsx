import { PageHeader } from "@/components/ui";
import { listarClientesComViaturas } from "@/lib/data/clientes";
import { obterConfiguracaoPrecos } from "@/lib/data/precos";
import { listarExtrasCatalogo } from "@/lib/data/extras";
import AssistenteMarcacao from "./AssistenteMarcacao";

export default async function MarcacaoRapidaPage() {
  const [clientes, precos, extrasCatalogo] = await Promise.all([
    listarClientesComViaturas(),
    obterConfiguracaoPrecos(),
    listarExtrasCatalogo(),
  ]);

  return (
    <>
      <PageHeader titulo="Nova marcação" voltarPara="/pedidos" />
      <AssistenteMarcacao clientes={clientes} precos={precos} extrasCatalogo={extrasCatalogo} />
    </>
  );
}
