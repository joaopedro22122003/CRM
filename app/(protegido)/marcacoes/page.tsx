import { PageHeader } from "@/components/ui";
import { listarTodasMarcacoes } from "@/lib/data/marcacoes";
import CalendarioMarcacoes from "./CalendarioMarcacoes";

export default async function MarcacoesPage() {
  const marcacoes = await listarTodasMarcacoes();

  return (
    <>
      <PageHeader titulo="Marcações" />
      <CalendarioMarcacoes marcacoes={marcacoes} />
    </>
  );
}
