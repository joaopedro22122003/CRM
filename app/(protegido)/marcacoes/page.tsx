import Link from "next/link";
import { addDays, format, startOfWeek } from "date-fns";
import { pt } from "date-fns/locale";
import { PageHeader, Cartao, Badge } from "@/components/ui";
import { listarMarcacoesEntre } from "@/lib/data/marcacoes";

export default async function MarcacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>;
}) {
  const { semana } = await searchParams;
  const dataBase = semana ? new Date(semana) : new Date();
  const inicio = startOfWeek(dataBase, { weekStartsOn: 1 });
  const fim = addDays(inicio, 7);

  const marcacoes = await listarMarcacoesEntre(inicio.toISOString(), fim.toISOString());

  const dias = Array.from({ length: 7 }, (_, i) => addDays(inicio, i));
  const semanaAnterior = format(addDays(inicio, -7), "yyyy-MM-dd");
  const semanaSeguinte = format(addDays(inicio, 7), "yyyy-MM-dd");

  return (
    <>
      <PageHeader titulo="Marcações" />

      <div className="flex items-center justify-between px-4 py-3">
        <Link href={`/marcacoes?semana=${semanaAnterior}`} className="text-sm font-semibold text-neutral-600">
          ← Anterior
        </Link>
        <span className="text-sm font-medium text-neutral-900">
          {format(inicio, "d MMM", { locale: pt })} – {format(addDays(inicio, 6), "d MMM", { locale: pt })}
        </span>
        <Link href={`/marcacoes?semana=${semanaSeguinte}`} className="text-sm font-semibold text-neutral-600">
          Seguinte →
        </Link>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-4">
        {dias.map((dia) => {
          const doDia = marcacoes.filter((m) => isMesmoDia(new Date(m.data_hora), dia));
          const ehHoje = isMesmoDia(dia, new Date());
          return (
            <section key={dia.toISOString()} className="flex flex-col gap-2">
              <h2 className={`text-sm font-semibold ${ehHoje ? "text-neutral-900" : "text-neutral-500"}`}>
                {format(dia, "EEEE, d 'de' MMMM", { locale: pt })}
                {ehHoje && <span className="ml-2 text-xs font-normal text-neutral-400">(hoje)</span>}
              </h2>
              {doDia.length === 0 ? (
                <p className="text-sm text-neutral-400">Sem marcações</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {doDia.map((m) => (
                    <li key={m.id}>
                      <Link href={`/marcacoes/${m.id}`}>
                        <Cartao className="flex items-center justify-between gap-3 active:bg-neutral-50">
                          <div className="min-w-0">
                            <p className="font-semibold text-neutral-900">
                              {format(new Date(m.data_hora), "HH:mm")} · {m.pedido.cliente.nome}
                            </p>
                            <p className="truncate text-sm text-neutral-500">
                              {m.pedido.viatura ? `${m.pedido.viatura.marca} ${m.pedido.viatura.modelo}` : "Sem viatura"}
                              {m.tipo === "recolha_entrega" && m.zona ? ` · ${m.zona}` : ""}
                            </p>
                          </div>
                          <Badge cor={m.tipo === "recolha_entrega" ? "roxo" : "cinza"}>
                            {m.tipo === "recolha_entrega" ? "Recolha" : "Cliente traz"}
                          </Badge>
                        </Cartao>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

function isMesmoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
