"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { pt } from "date-fns/locale";
import CalendarioMes from "@/components/CalendarioMes";
import { Cartao, Badge, BotaoLink, EstadoVazio } from "@/components/ui";
import type { MarcacaoResumo } from "@/lib/data/marcacoes";

export default function CalendarioMarcacoes({ marcacoes }: { marcacoes: MarcacaoResumo[] }) {
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(hoje);
  const [diaSelecionado, setDiaSelecionado] = useState<Date>(hoje);

  function contarEventosNoDia(dia: Date): number {
    return marcacoes.filter((m) => isSameDay(new Date(m.data_hora), dia)).length;
  }

  const marcacoesDoDia = useMemo(
    () => marcacoes.filter((m) => isSameDay(new Date(m.data_hora), diaSelecionado)),
    [marcacoes, diaSelecionado]
  );

  return (
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5">
      <Cartao className="sm:shrink-0 sm:self-start">
        <CalendarioMes
          mesAtual={mesAtual}
          onMudarMes={setMesAtual}
          diaSelecionado={diaSelecionado}
          onSelecionarDia={(dia) => {
            setDiaSelecionado(dia);
            setMesAtual(dia);
          }}
          contarEventosNoDia={contarEventosNoDia}
        />
      </Cartao>

      <section className="flex min-w-0 flex-1 flex-col gap-2 sm:border-l sm:border-neutral-200 sm:pl-5">
        <h2 className="text-sm font-semibold capitalize text-neutral-700">
          {format(diaSelecionado, "EEEE, d 'de' MMMM", { locale: pt })}
        </h2>

        {marcacoesDoDia.length === 0 ? (
          <EstadoVazio
            titulo="Sem marcações neste dia"
            acao={<BotaoLink href="/marcacao-rapida">+ Nova marcação</BotaoLink>}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {marcacoesDoDia.map((m) => (
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
    </div>
  );
}
