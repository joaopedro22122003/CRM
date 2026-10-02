import { PageHeader } from "@/components/ui";
import { listarClientesComViaturas } from "@/lib/data/clientes";
import { obterConfiguracaoPrecos } from "@/lib/data/precos";
import { listarExtrasCatalogo } from "@/lib/data/extras";
import { listarTodasMarcacoes } from "@/lib/data/marcacoes";
import AssistenteMarcacao from "./AssistenteMarcacao";

export default async function MarcacaoRapidaPage() {
  const [clientes, precos, extrasCatalogo, marcacoes] = await Promise.all([
    listarClientesComViaturas(),
    obterConfiguracaoPrecos(),
    listarExtrasCatalogo(),
    listarTodasMarcacoes(),
  ]);

  return (
    <>
      <PageHeader titulo="Nova marcação" voltarPara="/pedidos" />
      <AssistenteMarcacao clientes={clientes} precos={precos} extrasCatalogo={extrasCatalogo} marcacoes={marcacoes} />
    </>
  );
}
